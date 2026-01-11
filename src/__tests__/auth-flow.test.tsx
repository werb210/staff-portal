// @vitest-environment jsdom
import "@testing-library/jest-dom/vitest";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { createElement } from "react";
import apiClient, { ApiError } from "@/api/client";
import { AuthProvider, useAuth } from "@/auth/AuthContext";
import { fetchCurrentUser } from "@/api/auth";
import { startOtp as startOtpService, verifyOtp as verifyOtpService, logout as logoutService } from "@/services/auth";
import LoginPage from "@/pages/login/LoginPage";

vi.mock("@/api/auth", () => ({
  fetchCurrentUser: vi.fn()
}));

vi.mock("@/services/auth", () => ({
  startOtp: vi.fn(),
  verifyOtp: vi.fn(),
  logout: vi.fn()
}));

const mockedStartOtp = vi.mocked(startOtpService);
const mockedVerifyOtp = vi.mocked(verifyOtpService);
const mockedLogout = vi.mocked(logoutService);
const mockedFetchCurrentUser = vi.mocked(fetchCurrentUser);

const TestAuthState = () => {
  const { status } = useAuth();
  return createElement("span", { "data-testid": "status" }, status);
};

const TestVerifyAction = () => {
  const { verifyOtp } = useAuth();
  return createElement(
    "button",
    { type: "button", onClick: () => void verifyOtp("123456", "+15555550100") },
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
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
    mockedFetchCurrentUser.mockResolvedValue({ id: "1", email: "demo@example.com", role: "ADMIN" });
    mockedLogout.mockResolvedValue(undefined);
    vi.spyOn(window.location, "assign").mockImplementation(() => undefined);
  });

  it("verifies OTP successfully", async () => {
    mockedVerifyOtp.mockResolvedValue({
      accessToken: "token-123",
      refreshToken: "refresh-123",
      user: { id: "1", email: "demo@example.com", role: "ADMIN" }
    });

    render(
      <AuthProvider>
        <TestVerifyAction />
        <TestAuthState />
      </AuthProvider>
    );

    fireEvent.click(screen.getByRole("button", { name: "Verify" }));

    await waitFor(() => expect(screen.getByTestId("status")).toHaveTextContent("authenticated"));
    expect(localStorage.getItem("accessToken")).toBe("token-123");
    expect(localStorage.getItem("refreshToken")).toBe("refresh-123");
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
      <AuthProvider>
        <LoginPage />
      </AuthProvider>
    );

    fireEvent.change(screen.getByLabelText(/Phone number/i), { target: { value: "+15555550100" } });
    fireEvent.click(screen.getByRole("button", { name: /Send code/i }));

    if (code !== "missing_idempotency_key") {
      await waitFor(() => expect(mockedStartOtp).toHaveBeenCalled());
      fireEvent.change(screen.getByLabelText(/Verification code/i), { target: { value: "000000" } });
      fireEvent.click(screen.getByRole("button", { name: /Verify code/i }));
    }

    if (code === "missing_idempotency_key") {
      await waitFor(() => expect(screen.getByText(/Start failed/i)).toBeInTheDocument());
    } else {
      await waitFor(() => expect(screen.getByText(/Invalid verification code/i)).toBeInTheDocument());
    }
  });

  it("refreshes tokens after mid-session expiry", async () => {
    localStorage.setItem("accessToken", "expired-token");
    localStorage.setItem("refreshToken", "refresh-token");

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

    await apiClient.get("/secure", { adapter } as any);

    expect(localStorage.getItem("accessToken")).toBe("new-token");
  });

  it("forces logout on refresh failure", async () => {
    localStorage.setItem("accessToken", "expired-token");
    localStorage.setItem("refreshToken", "refresh-token");

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

    render(
      <AuthProvider>
        <TestAuthState />
      </AuthProvider>
    );

    await expect(apiClient.get("/secure", { adapter } as any)).rejects.toBeInstanceOf(ApiError);

    await waitFor(() => expect(screen.getByTestId("status")).toHaveTextContent("expired"));
  });

  it("clears session on manual logout", async () => {
    localStorage.setItem("accessToken", "token-123");
    localStorage.setItem("refreshToken", "refresh-123");

    render(
      <AuthProvider>
        <TestLogoutAction />
        <TestAuthState />
      </AuthProvider>
    );

    fireEvent.click(screen.getByRole("button", { name: "Logout" }));

    expect(mockedLogout).toHaveBeenCalled();
    expect(localStorage.getItem("accessToken")).toBeNull();
    expect(screen.getByTestId("status")).toHaveTextContent("unauthenticated");
  });
});
