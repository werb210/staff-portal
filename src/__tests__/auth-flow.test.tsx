// @vitest-environment jsdom
import "@testing-library/jest-dom/vitest";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { createElement } from "react";
import apiClient, { ApiError } from "@/api/client";
import { AuthProvider, useAuth } from "@/auth/AuthContext";
import { fetchCurrentUser } from "@/api/auth";
import { login as loginService, logout as logoutService } from "@/services/auth";
import LoginPage from "@/pages/login/LoginPage";

vi.mock("@/api/auth", () => ({
  fetchCurrentUser: vi.fn()
}));

vi.mock("@/services/auth", () => ({
  login: vi.fn(),
  logout: vi.fn()
}));

const mockedLogin = vi.mocked(loginService);
const mockedLogout = vi.mocked(logoutService);
const mockedFetchCurrentUser = vi.mocked(fetchCurrentUser);

const TestAuthState = () => {
  const { status } = useAuth();
  return createElement("span", { "data-testid": "status" }, status);
};

const TestLoginAction = () => {
  const { login } = useAuth();
  return createElement(
    "button",
    { type: "button", onClick: () => void login("demo@example.com", "password") },
    "Login"
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

  it("logs in successfully", async () => {
    mockedLogin.mockResolvedValue({
      accessToken: "token-123",
      refreshToken: "refresh-123",
      user: { id: "1", email: "demo@example.com", role: "ADMIN" }
    });

    render(
      <AuthProvider>
        <TestLoginAction />
        <TestAuthState />
      </AuthProvider>
    );

    fireEvent.click(screen.getByRole("button", { name: "Login" }));

    await waitFor(() => expect(screen.getByTestId("status")).toHaveTextContent("authenticated"));
    expect(localStorage.getItem("accessToken")).toBe("token-123");
    expect(localStorage.getItem("refreshToken")).toBe("refresh-123");
  });

  it.each([
    ["invalid_credentials", 401],
    ["missing_idempotency_key", 400],
    ["account_locked", 401],
    ["password_expired", 401]
  ])("surfaces login failures for %s", async (code, status) => {
    mockedLogin.mockRejectedValue(
      new ApiError({ status, message: "Login failed", code })
    );

    render(
      <AuthProvider>
        <LoginPage />
      </AuthProvider>
    );

    fireEvent.change(screen.getByLabelText(/Email/i), { target: { value: "demo@example.com" } });
    fireEvent.change(screen.getByLabelText(/Password/i), { target: { value: "password" } });
    fireEvent.click(screen.getByRole("button", { name: /Login/i }));

    await waitFor(() => expect(screen.getByText(code)).toBeInTheDocument());
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
