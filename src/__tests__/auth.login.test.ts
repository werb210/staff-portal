import { beforeEach, describe, expect, it, vi } from "vitest";
import apiClient, { ApiError } from "@/api/client";
import { login } from "@/services/auth";

const adapter = vi.fn(async (config) => ({
  data: {},
  status: 200,
  statusText: "OK",
  headers: {},
  config,
}));

describe("auth login", () => {
  beforeEach(() => {
    adapter.mockClear();
    sessionStorage.clear();
  });

  it("login succeeds with Idempotency-Key", async () => {
    const loginAdapter = vi.fn(async (config) => ({
      data: { accessToken: "token-123", user: { id: "1", email: "demo@example.com", role: "ADMIN" }, requestId: "req-1" },
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

  it("login fails without token", async () => {
    const apiPostSpy = vi.spyOn(apiClient, "post").mockResolvedValueOnce({
      user: { id: "1", email: "demo@example.com", role: "ADMIN" },
    } as any);

    await expect(login("demo@example.com", "password"))
      .rejects
      .toThrow("Login response missing access token");

    apiPostSpy.mockRestore();
  });

  it("parses 400 errors and preserves requestId", async () => {
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
      expect(apiError.code).toBe("missing_idempotency_key");
      expect(apiError.message).toBe("Idempotency-Key required");
      expect(apiError.requestId).toBe("req-400");
    }

    consoleErrorSpy.mockRestore();
  });

  it("retains existing adapter behavior", async () => {
    await apiClient.get("/example", { adapter } as any);
    expect(adapter).toHaveBeenCalledOnce();
  });
});
