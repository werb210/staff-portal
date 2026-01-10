// @vitest-environment jsdom
import "@testing-library/jest-dom/vitest";
import apiClient, { ApiError } from "@/api/client";
import { AuthProvider, useAuth } from "@/auth/AuthContext";
import { fetchCurrentUser } from "@/api/auth";
import { login } from "@/services/auth";
import { getStoredAccessToken, getStoredUser, setStoredAccessToken, setStoredRefreshToken, setStoredUser } from "@/services/token";
import { render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { createElement } from "react";

vi.mock("@/config/runtime", () => ({
  getApiBaseUrlOptional: () => "http://localhost",
  getApiBaseUrl: () => "http://localhost"
}));

vi.mock("@/api/auth", () => ({
  fetchCurrentUser: vi.fn()
}));

const mockedFetchCurrentUser = vi.mocked(fetchCurrentUser);

const adapter = vi.fn(async (config) => ({
  data: {},
  status: 200,
  statusText: "OK",
  headers: {},
  config,
}));

const TestAuthState = () => {
  const { status, user, token } = useAuth();
  return createElement(
    "div",
    null,
    createElement("span", { "data-testid": "status" }, status),
    createElement("span", { "data-testid": "token" }, token ?? ""),
    createElement("span", { "data-testid": "user" }, user?.email ?? "")
  );
};

const TestLoginAction = () => {
  const { login } = useAuth();

  return createElement(
    "button",
    { type: "button", onClick: () => void login("demo@example.com", "password") },
    "Login"
  );
};

describe("auth login", () => {
  beforeEach(() => {
    adapter.mockClear();
    sessionStorage.clear();
    vi.restoreAllMocks();
    mockedFetchCurrentUser.mockResolvedValue({ id: "1", email: "demo@example.com", role: "ADMIN" });
  });

  it("login succeeds with Idempotency-Key", async () => {
    const loginAdapter = vi.fn(async (config) => ({
      data: {
        accessToken: "token-123",
        refreshToken: "refresh-123",
        user: { id: "1", email: "demo@example.com", role: "ADMIN" },
        requestId: "req-1"
      },
      status: 200,
      statusText: "OK",
      headers: {},
      config,
    }));

    const response = await apiClient.post<{ accessToken: string; requestId?: string }>(
      "/auth/login",
      { email: "demo@example.com", password: "password" },
      { skipAuth: true, adapter: loginAdapter } as any
    );

    expect(loginAdapter).toHaveBeenCalledOnce();
    const passedConfig = loginAdapter.mock.calls[0][0];
    const idempotencyKey =
      passedConfig?.headers?.["Idempotency-Key"] ?? passedConfig?.headers?.get?.("Idempotency-Key");
    expect(idempotencyKey).toBeTruthy();
    expect(response.accessToken).toBe("token-123");
    expect(response.requestId).toBe("req-1");
  });

  it("login fails without tokens", async () => {
    const apiPostSpy = vi.spyOn(apiClient, "post").mockResolvedValueOnce({
      user: { id: "1", email: "demo@example.com", role: "ADMIN" },
    } as any);

    await expect(login("demo@example.com", "password"))
      .rejects
      .toThrow("Login response missing access token");

    apiPostSpy.mockRestore();
  });

  it("login fails without Idempotency-Key", async () => {
    const consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => undefined);
    const errorAdapter = vi.fn(async (config) => ({
      data: { code: "missing_idempotency_key", message: "Idempotency-Key required", requestId: "req-400" },
      status: 400,
      statusText: "Bad Request",
      headers: {},
      config,
    }));

    await expect(
      apiClient.post("/auth/login", { email: "demo@example.com", password: "password" }, { skipAuth: true, adapter: errorAdapter } as any)
    ).rejects.toBeInstanceOf(ApiError);

    try {
      await apiClient.post("/auth/login", { email: "demo@example.com", password: "password" }, { skipAuth: true, adapter: errorAdapter } as any);
    } catch (error) {
      const apiError = error as ApiError;
      expect((apiError.details as { code?: string } | undefined)?.code).toBe("missing_idempotency_key");
      expect(apiError.status).toBe(400);
      expect(apiError.requestId).toBe("req-400");
    }

    consoleErrorSpy.mockRestore();
  });

  it("retains existing adapter behavior", async () => {
    await apiClient.get("/example", { adapter, skipAuth: true } as any);
    expect(adapter).toHaveBeenCalledOnce();
  });

  it("stores tokens after a successful login", async () => {
    vi.spyOn(apiClient, "post").mockResolvedValueOnce({
      accessToken: "token-456",
      refreshToken: "refresh-456",
      user: { id: "1", email: "demo@example.com", role: "ADMIN" }
    });

    render(createElement(AuthProvider, null, createElement(TestLoginAction)));

    screen.getByRole("button", { name: "Login" }).click();

    await waitFor(() => expect(getStoredAccessToken()).toBe("token-456"));
    expect(getStoredUser<{ email: string }>()?.email).toBe("demo@example.com");
  });

  it("restores session on reload", async () => {
    setStoredAccessToken("token-999");
    setStoredRefreshToken("refresh-999");
    setStoredUser({ id: "1", email: "restored@example.com", role: "ADMIN" });

    render(createElement(AuthProvider, null, createElement(TestAuthState)));

    await waitFor(() => expect(screen.getByTestId("status")).toHaveTextContent("authenticated"));
    expect(screen.getByTestId("token")).toHaveTextContent("token-999");
    expect(screen.getByTestId("user")).toHaveTextContent("demo@example.com");
  });
});
