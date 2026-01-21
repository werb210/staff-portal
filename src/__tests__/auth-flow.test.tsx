// @vitest-environment jsdom
import "@testing-library/jest-dom/vitest";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { createElement } from "react";
import { MemoryRouter, Route, Routes, useLocation } from "react-router-dom";
import { AuthProvider, useAuth } from "@/auth/AuthContext";
import RequireAuth from "@/routes/RequireAuth";
import { startOtp as startOtpService, verifyOtp as verifyOtpService, logout as logoutService } from "@/services/auth";
import LoginPage from "@/pages/login/LoginPage";
import PrivateRoute from "@/router/PrivateRoute";
import { ApiError } from "@/api/http";
import { clearStoredAuth, setStoredAccessToken } from "@/services/token";

vi.mock("@/services/auth", () => ({
  startOtp: vi.fn(),
  verifyOtp: vi.fn(),
  logout: vi.fn()
}));

vi.mock("@/services/api", async () => {
  const actual = await vi.importActual<typeof import("@/services/api")>("@/services/api");
  return {
    ...actual,
    redirectToLogin: vi.fn()
  };
});

const mockedStartOtp = vi.mocked(startOtpService);
const mockedVerifyOtp = vi.mocked(verifyOtpService);
const mockedLogout = vi.mocked(logoutService);

const createJsonResponse = (data: unknown, status = 200) =>
  new Response(JSON.stringify(data), {
    status,
    headers: { "content-type": "application/json" }
  });

const TestAuthState = () => {
  const { authStatus, rolesStatus } = useAuth();
  return createElement("span", { "data-testid": "status" }, `${authStatus}:${rolesStatus}`);
};

const TestAuthRole = () => {
  const { user } = useAuth();
  return createElement("span", { "data-testid": "role" }, user?.role ?? "UNKNOWN");
};

const TestVerifyAction = () => {
  const { verifyOtp } = useAuth();
  return createElement(
    "button",
    {
      type: "button",
      onClick: () => void verifyOtp({ code: "123456", phone: "+15555550100" })
    },
    "Verify"
  );
};

const TestLogoutAction = () => {
  const { logout } = useAuth();
  return createElement("button", { type: "button", onClick: () => logout() }, "Logout");
};

const LocationProbe = () => {
  const location = useLocation();
  return <span data-testid="location">{location.pathname}</span>;
};

describe("auth flow", () => {
  afterEach(() => {
    cleanup();
    vi.unstubAllGlobals();
  });

  beforeEach(() => {
    clearStoredAuth();
    vi.clearAllMocks();
    mockedLogout.mockResolvedValue(undefined);
  });

  it("verifies OTP successfully", async () => {
    const fetchSpy = vi.fn().mockResolvedValue(createJsonResponse({ id: "1", role: "Admin" }));
    vi.stubGlobal("fetch", fetchSpy);
    mockedVerifyOtp.mockResolvedValue({ accessToken: "access", refreshToken: "refresh" });

    render(
      <AuthProvider>
        <TestVerifyAction />
        <TestAuthState />
        <TestAuthRole />
      </AuthProvider>
    );

    fireEvent.click(screen.getByRole("button", { name: "Verify" }));

    await waitFor(() =>
      expect(screen.getByTestId("status")).toHaveTextContent("authenticated:resolved")
    );
    expect(screen.getByTestId("role")).toHaveTextContent("Admin");
    expect(fetchSpy).toHaveBeenCalledWith("/api/auth/me", { credentials: "include" });
  });

  it("does not redirect during auth hydration after OTP verification", async () => {
    mockedStartOtp.mockResolvedValue(null);
    mockedVerifyOtp.mockResolvedValue({ accessToken: "access", refreshToken: "refresh" });

    let resolveFetch: (value: Response) => void = () => undefined;
    const pendingFetch = new Promise<Response>((resolve) => {
      resolveFetch = resolve;
    });
    const fetchSpy = vi.fn().mockReturnValue(pendingFetch);
    vi.stubGlobal("fetch", fetchSpy);

    render(
      <MemoryRouter initialEntries={["/login"]}>
        <AuthProvider>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route
              path="/dashboard"
              element={
                <PrivateRoute allowedRoles={["Admin", "Staff"]}>
                  <div>Dashboard</div>
                </PrivateRoute>
              }
            />
          </Routes>
          <LocationProbe />
        </AuthProvider>
      </MemoryRouter>
    );

    fireEvent.change(screen.getByLabelText(/Phone number/i), { target: { value: "+1 555 555 0100" } });
    fireEvent.click(screen.getByRole("button", { name: /Send code/i }));

    const otpInput = await screen.findByLabelText(/verification code/i);
    fireEvent.change(otpInput, { target: { value: "123456" } });
    fireEvent.click(screen.getByRole("button", { name: /Verify code/i }));

    await waitFor(() => {
      expect(screen.getByTestId("location")).toHaveTextContent("/login");
    });

    resolveFetch(createJsonResponse({ id: "1", role: "Staff" }));

    await waitFor(() => {
      expect(screen.getByTestId("location")).toHaveTextContent("/dashboard");
    });
    expect(screen.getByText("Dashboard")).toBeInTheDocument();
  });

  it("renders protected routes after /api/auth/me succeeds", async () => {
    setStoredAccessToken("test-token");
    const fetchSpy = vi.fn().mockResolvedValue(createJsonResponse({ id: "1", role: "Staff" }));
    vi.stubGlobal("fetch", fetchSpy);

    render(
      <MemoryRouter initialEntries={["/dashboard"]}>
        <AuthProvider>
          <Routes>
            <Route
              path="/dashboard"
              element={
                <PrivateRoute allowedRoles={["Admin", "Staff"]}>
                  <div>Dashboard Shell</div>
                </PrivateRoute>
              }
            />
          </Routes>
          <LocationProbe />
        </AuthProvider>
      </MemoryRouter>
    );

    await waitFor(() => expect(screen.getByText("Dashboard Shell")).toBeInTheDocument());
    expect(screen.getByTestId("location")).toHaveTextContent("/dashboard");
  });

  it("hydrates user on refresh", async () => {
    setStoredAccessToken("test-token");
    const fetchSpy = vi
      .fn()
      .mockResolvedValue(createJsonResponse({ id: "1", role: "Admin", email: "demo@example.com" }));
    vi.stubGlobal("fetch", fetchSpy);

    render(
      <AuthProvider>
        <TestAuthState />
        <TestAuthRole />
      </AuthProvider>
    );

    await waitFor(() =>
      expect(screen.getByTestId("status")).toHaveTextContent("authenticated:resolved")
    );
    expect(screen.getByTestId("role")).toHaveTextContent("Admin");
  });

  it.each([
    ["invalid_otp", 401],
    ["missing_idempotency_key", 400]
  ])("surfaces OTP failures for %s", async (code, status) => {
    if (code === "missing_idempotency_key") {
      mockedStartOtp.mockRejectedValue(new ApiError({ status, message: "Start failed", code }));
    } else {
      mockedVerifyOtp.mockRejectedValue(new ApiError({ status, message: "Verify failed", code }));
    }

    render(
      <MemoryRouter>
        <AuthProvider>
          <LoginPage />
        </AuthProvider>
      </MemoryRouter>
    );

    fireEvent.change(screen.getByLabelText(/Phone number/i), { target: { value: "+1 555 555 0100" } });
    fireEvent.click(screen.getByRole("button", { name: /Send code/i }));

    if (code !== "missing_idempotency_key") {
      await waitFor(() => expect(mockedStartOtp).toHaveBeenCalled());
      fireEvent.change(screen.getByLabelText(/Verification code/i), { target: { value: "000000" } });
      fireEvent.click(screen.getByRole("button", { name: /Verify code/i }));
    }

    await waitFor(() => expect(screen.getByText(/failed/i)).toBeInTheDocument());
  });

  it("clears token on manual logout", async () => {
    setStoredAccessToken("test-token");
    const fetchSpy = vi
      .fn()
      .mockResolvedValue(createJsonResponse({ id: "1", role: "Admin", email: "demo@example.com" }));
    vi.stubGlobal("fetch", fetchSpy);

    render(
      <MemoryRouter initialEntries={["/dashboard"]}>
        <AuthProvider>
          <TestAuthState />
          <Routes>
            <Route
              path="/dashboard"
              element={
                <RequireAuth>
                  <div>
                    <TestLogoutAction />
                  </div>
                </RequireAuth>
              }
            />
            <Route path="/login" element={<div>Login</div>} />
          </Routes>
          <LocationProbe />
        </AuthProvider>
      </MemoryRouter>
    );

    await waitFor(() =>
      expect(screen.getByTestId("status")).toHaveTextContent("authenticated:resolved")
    );

    fireEvent.click(screen.getByRole("button", { name: "Logout" }));

    await waitFor(() => expect(mockedLogout).toHaveBeenCalled());
    await waitFor(() =>
      expect(screen.getByTestId("status")).toHaveTextContent("unauthenticated:resolved")
    );
    await waitFor(() => expect(screen.getByTestId("location")).toHaveTextContent("/login"));
  });
});
