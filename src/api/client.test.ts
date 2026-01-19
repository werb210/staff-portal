import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/services/api", async () => {
  const actual = await vi.importActual<typeof import("@/services/api")>("@/services/api");
  return {
    ...actual,
    redirectToLogin: vi.fn()
  };
});

import apiClient from "./httpClient";
import { buildApiUrl, redirectToLogin } from "@/services/api";
import { registerAuthFailureHandler } from "@/auth/authEvents";
import { ACCESS_TOKEN_KEY } from "@/services/token";

let failureHandler: ReturnType<typeof vi.fn>;

const adapter = vi.fn(async (config) => ({
  data: {},
  status: 200,
  statusText: "OK",
  headers: {},
  config,
}));

describe("apiClient auth", () => {
  beforeEach(() => {
    localStorage.clear();
    adapter.mockClear();
    failureHandler = vi.fn();
    registerAuthFailureHandler(failureHandler);
  });

  it("throws before sending a request when the token is missing", async () => {
    await expect(
      apiClient.get("/example", { adapter } as any)
    ).rejects.toThrow("Missing access token");

    expect(adapter).not.toHaveBeenCalled();
    expect(failureHandler).toHaveBeenCalledWith("missing-token");
  });

  it("attaches the bearer token to outbound requests", async () => {
    localStorage.setItem(ACCESS_TOKEN_KEY, "abc123");

    await apiClient.get("/example", { adapter } as any);

    expect(adapter).toHaveBeenCalledOnce();
    const passedConfig = adapter.mock.calls[0][0];
    expect(passedConfig?.headers?.Authorization).toBe("Bearer abc123");
    expect(passedConfig?.url).toBe(buildApiUrl("/example"));
  });

  it("clears auth and redirects on 401 responses", async () => {
    localStorage.setItem(ACCESS_TOKEN_KEY, "expired-token");

    const unauthorizedAdapter = vi.fn(async (config) => ({
      data: {},
      status: 401,
      statusText: "Unauthorized",
      headers: {},
      config,
    }));

    await expect(
      apiClient.get("/secure", { adapter: unauthorizedAdapter } as any)
    ).rejects.toBeDefined();

    expect(failureHandler).toHaveBeenCalledWith("unauthorized");
  });

  it("redirects to login when the token is missing", async () => {
    await expect(
      apiClient.get("/secure", { adapter } as any)
    ).rejects.toBeDefined();

    expect(redirectToLogin).toHaveBeenCalled();
  });

  it("adds idempotency and content type headers for authenticated mutating requests", async () => {
    localStorage.setItem(ACCESS_TOKEN_KEY, "abc123");

    await apiClient.post("/example", { name: "Atlas" }, { adapter } as any);

    expect(adapter).toHaveBeenCalledOnce();
    const passedConfig = adapter.mock.calls[0][0];
    expect(passedConfig?.headers?.Authorization).toBe("Bearer abc123");
    expect(passedConfig?.headers?.["Content-Type"]).toBe("application/json");
    expect(passedConfig?.headers?.["Idempotency-Key"]).toBeDefined();
  });

  it("skips idempotency when no token is present", async () => {
    await apiClient.post("/example", { name: "Atlas" }, { adapter, skipAuth: true } as any);

    expect(adapter).toHaveBeenCalledOnce();
    const passedConfig = adapter.mock.calls[0][0];
    expect(passedConfig?.headers?.["Idempotency-Key"]).toBeUndefined();
  });
});
