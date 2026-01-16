// @vitest-environment jsdom
import "@testing-library/jest-dom/vitest";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { createElement } from "react";
import { MemoryRouter } from "react-router-dom";
import axios from "axios";
import apiClient, { ApiError, setAxiosAdapterForTests } from "@/api/client";
import { AuthProvider, useAuth } from "@/auth/AuthContext";
import { fetchCurrentUser } from "@/api/auth";
import { startOtp as startOtpService, verifyOtp as verifyOtpService, fetchSession as fetchSessionService, logout as logoutService } from "@/services/auth";
import LoginPage from "@/pages/login/LoginPage";
import { redirectToDashboard } from "@/services/api";
import { ACCESS_TOKEN_KEY, REFRESH_TOKEN_KEY } from "@/services/token";

vi.mock("@/api/auth", () => ({
  fetchCurrentUser: vi.fn()
}));

vi.mock("@/services/auth", () => ({
  startOtp: vi.fn(),
  verifyOtp: vi.fn(),
  fetchSession: vi.fn(),
  logout: vi.fn()
}));

vi.mock("@/services/api", async () => {
  const actual = await vi.importActual<typeof import("@/services/api")>("@/services/api");
  return {
    ...actual,
    redirectToLogin: vi.fn(),
    redirectToDashboard: vi.fn()
  };
});

const mockedStartOtp = vi.mocked(startOtpService);
const mockedVerifyOtp = vi.mocked(verifyOtpService);
const mockedFetchSession = vi.mocked(fetchSessionService);
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
    { type: "button", onClick: () => void verifyOtp({ code: "123456", phone: "+15555550100" }) },
    "Verify"
  );
};

const TestLogoutAction = () => {
  const { logout } = useAuth();
  return createElement(
    "button",
    { type: "button", onClick: () => logout() },
    "Logout"
  );
};

describe("auth flow", () => {
  afterEach(() => {
    cleanup();
    setAxiosAdapterForTests(undefined);
    axios.defaults.adapter = undefined;
  });

  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
    mockedFetchCurrentUser.mockResolvedValue({ id: "1", email: "demo@example.com", role: "Admin" });
    mockedLogout.mockResolvedValue(undefined);
  });

  it("verifies OTP successfully", async () => {
    mockedVerifyOtp.mockResolvedValue({
      accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.mock.payload.signature",
      refreshToken: "refresh-123",
      user: { id: "1", email: "demo@example.com", role: "Admin" }
    });

    render(
      <AuthProvider>
        <TestVerifyAction />
        <TestAuthState />
        <TestAuthRole />
      </AuthProvider>
    );

    fireEvent.click(screen.getByRole("button", { name: "Verify" }));

    await waitFor(() => expect(screen.getByTestId("status")).toHaveTextContent("authenticated"));
    expect(mockedFetchCurrentUser).toHaveBeenCalled();
    expect(mockedFetchSession).not.toHaveBeenCalled();
    expect(screen.getByTestId("role")).toHaveTextContent("Admin");
    expect(localStorage.getItem(ACCESS_TOKEN_KEY)).toBe("eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.mock.payload.signature");
    expect(localStorage.getItem(REFRESH_TOKEN_KEY)).toBe("refresh-123");
    expect(redirectToDashboard).toHaveBeenCalled();
  });

  it("bootstraps session when OTP is already verified", async () => {
    mockedVerifyOtp.mockResolvedValue({ alreadyVerified: true });
    mockedFetchSession.mockResolvedValue({
      accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.session.payload.signature",
      refreshToken: "refresh-session",
      user: { id: "1", email: "demo@example.com", role: "Admin" }
    });

    render(
      <AuthProvider>
        <TestVerifyAction />
        <TestAuthState />
        <TestAuthRole />
      </AuthProvider>
    );

    fireEvent.click(screen.getByRole("button", { name: "Verify" }));

    await waitFor(() => expect(mockedFetchSession).toHaveBeenCalledTimes(1));
    await waitFor(() => expect(screen.getByTestId("status")).toHaveTextContent("authenticated"));
    expect(screen.getByTestId("role")).toHaveTextContent("Admin");
    expect(localStorage.getItem(ACCESS_TOKEN_KEY)).toBe("eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.session.payload.signature");
    expect(localStorage.getItem(REFRESH_TOKEN_KEY)).toBe("refresh-session");
  });

  it("attempts session bootstrap when OTP verify returns sent", async () => {
    mockedVerifyOtp.mockResolvedValue({ sent: true });
    mockedFetchSession.mockResolvedValue({
      accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.sent.payload.signature",
      refreshToken: "refresh-sent",
      user: { id: "1", email: "demo@example.com", role: "Admin" }
    });

    render(
      <AuthProvider>
        <TestVerifyAction />
        <TestAuthState />
      </AuthProvider>
    );

    fireEvent.click(screen.getByRole("button", { name: "Verify" }));

    await waitFor(() => expect(mockedFetchSession).toHaveBeenCalledTimes(1));
    await waitFor(() => expect(screen.getByTestId("status")).toHaveTextContent("authenticated"));
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

  it.skip("refreshes tokens after mid-session expiry", async () => {
    localStorage.setItem(ACCESS_TOKEN_KEY, "expired-token");
    localStorage.setItem(REFRESH_TOKEN_KEY, "refresh-token");

    let secureCalls = 0;
    const adapter = vi.fn(async (config) => {
      if (String(config.url).includes("/auth/refresh")) {
        return {
          data: { accessToken: "new-token", refreshToken: "refresh-token" },
          status: 200,
          statusText: "OK",
          headers: {},
          config
        };
      }

      if (String(config.url).includes("/secure")) {
        secureCalls += 1;
        if (secureCalls === 1) {
          return {
            data: {},
            status: 401,
            statusText: "Unauthorized",
            headers: {},
            config
          };
        }
        return {
          data: { ok: true },
          status: 200,
          statusText: "OK",
          headers: {},
          config
        };
      }

      return {
        data: {},
        status: 200,
        statusText: "OK",
        headers: {},
        config
      };
    });

    axios.defaults.adapter = adapter;
    setAxiosAdapterForTests(adapter);
    await apiClient.get("/secure", { adapter } as any);

    expect(localStorage.getItem(ACCESS_TOKEN_KEY)).toBe("new-token");
  });

  it.skip("forces logout on refresh failure", async () => {
    localStorage.setItem(ACCESS_TOKEN_KEY, "expired-token");
    localStorage.setItem(REFRESH_TOKEN_KEY, "refresh-token");

    const adapter = vi.fn(async (config) => {
      if (String(config.url).includes("/auth/refresh")) {
        return {
          data: {},
          status: 401,
          statusText: "Unauthorized",
          headers: {},
          config
        };
      }

      if (String(config.url).includes("/secure")) {
        return {
          data: {},
          status: 401,
          statusText: "Unauthorized",
          headers: {},
          config
        };
      }

      return {
        data: {},
        status: 200,
        statusText: "OK",
        headers: {},
        config
      };
    });

    axios.defaults.adapter = adapter;
    setAxiosAdapterForTests(adapter);
    render(
      <AuthProvider>
        <TestAuthState />
      </AuthProvider>
    );

    await expect(apiClient.get("/secure", { adapter } as any)).rejects.toBeInstanceOf(ApiError);

    await waitFor(() => expect(screen.getByTestId("status")).toHaveTextContent("expired"));
  });

  it("clears session on manual logout", async () => {
    localStorage.setItem(ACCESS_TOKEN_KEY, "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.mock.payload.signature");
    localStorage.setItem(REFRESH_TOKEN_KEY, "refresh-123");

    render(
      <AuthProvider>
        <TestLogoutAction />
        <TestAuthState />
      </AuthProvider>
    );

    fireEvent.click(screen.getByRole("button", { name: "Logout" }));

    expect(mockedLogout).toHaveBeenCalled();
    expect(localStorage.getItem(ACCESS_TOKEN_KEY)).toBeNull();
    expect(screen.getByTestId("status")).toHaveTextContent("unauthenticated");
  });
});
