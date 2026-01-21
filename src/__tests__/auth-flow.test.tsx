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
import { fetchCurrentUser } from "@/api/auth";
import { ApiError } from "@/api/http";
import { clearStoredAuth, setStoredAccessToken } from "@/services/token";

vi.mock("@/services/auth", () => ({
  startOtp: vi.fn(),
  verifyOtp: vi.fn(),
  logout: vi.fn()
}));

vi.mock("@/api/auth", () => ({
  fetchCurrentUser: vi.fn()
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
const mockedFetchCurrentUser = vi.mocked(fetchCurrentUser);

const TestAuthState = () => {
  const { status } = useAuth();
  return createElement("span", { "data-testid": "status" }, status);
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
  });

  beforeEach(() => {
    clearStoredAuth();
    vi.clearAllMocks();
    mockedLogout.mockResolvedValue(undefined);
  });

  it("verifies OTP successfully", async () => {
    mockedVerifyOtp.mockResolvedValue({ accessToken: "access", refreshToken: "refresh" });
    mockedFetchCurrentUser.mockResolvedValue({ data: { id: "1", role: "Admin" } } as any);

    render(
      <AuthProvider>
        <TestVerifyAction />
        <TestAuthState />
        <TestAuthRole />
      </AuthProvider>
    );

    fireEvent.click(screen.getByRole("button", { name: "Verify" }));

    await waitFor(() => expect(screen.getByTestId("status")).toHaveTextContent("authenticated"));
    expect(screen.getByTestId("role")).toHaveTextContent("Admin");
    expect(mockedFetchCurrentUser).toHaveBeenCalled();
  });

  it("hydrates user on refresh", async () => {
    setStoredAccessToken("test-token");
    mockedFetchCurrentUser.mockResolvedValue({
      data: { id: "1", role: "Admin", email: "demo@example.com" }
    } as any);

    render(
      <AuthProvider>
        <TestAuthState />
        <TestAuthRole />
      </AuthProvider>
    );

    await waitFor(() => expect(screen.getByTestId("status")).toHaveTextContent("authenticated"));
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
    fireEvent.click(screen.getByRole("button", { name: /Submit code/i }));

    if (code !== "missing_idempotency_key") {
      await waitFor(() => expect(mockedStartOtp).toHaveBeenCalled());
      fireEvent.change(screen.getByLabelText(/Verification code/i), { target: { value: "000000" } });
      fireEvent.click(screen.getByRole("button", { name: /Verify code/i }));
    }

    await waitFor(() => expect(screen.getByText(/failed/i)).toBeInTheDocument());
  });

  it("clears token on manual logout", async () => {
    setStoredAccessToken("test-token");
    mockedFetchCurrentUser.mockResolvedValue({
      data: { id: "1", role: "Admin", email: "demo@example.com" }
    } as any);

    render(
      <MemoryRouter initialEntries={["/dashboard"]}>
        <AuthProvider>
          <Routes>
            <Route
              path="/dashboard"
              element={
                <RequireAuth>
                  <div>
                    <TestLogoutAction />
                    <TestAuthState />
                    <LocationProbe />
                  </div>
                </RequireAuth>
              }
            />
            <Route path="/login" element={<div>Login</div>} />
          </Routes>
        </AuthProvider>
      </MemoryRouter>
    );

    await waitFor(() => expect(screen.getByTestId("status")).toHaveTextContent("authenticated"));

    fireEvent.click(screen.getByRole("button", { name: "Logout" }));

    await waitFor(() => expect(mockedLogout).toHaveBeenCalled());
    await waitFor(() => expect(screen.getByTestId("status")).toHaveTextContent("unauthenticated"));
    await waitFor(() => expect(screen.getByTestId("location")).toHaveTextContent("/login"));
  });
});
