import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/services/api", async () => {
  const actual = await vi.importActual<typeof import("@/services/api")>("@/services/api");
  return {
    ...actual,
    redirectToLogin: vi.fn()
  };
});

import apiClient from "./httpClient";
import { redirectToLogin } from "@/services/api";
import { buildRequestUrl } from "@/utils/apiLogging";
import { registerAuthFailureHandler } from "@/auth/authEvents";
import { clearStoredAuth, setStoredAccessToken } from "@/services/token";

let failureHandler: ReturnType<typeof vi.fn>;
let unregisterFailureHandler: (() => void) | null = null;

const adapter = vi.fn(async (config) => ({
  data: {},
  status: 200,
  statusText: "OK",
  headers: {},
  config
}));

describe("apiClient auth", () => {
  beforeEach(() => {
    clearStoredAuth();
    adapter.mockClear();
    failureHandler = vi.fn();
    unregisterFailureHandler = registerAuthFailureHandler(failureHandler);
  });

  afterEach(() => {
    unregisterFailureHandler?.();
    unregisterFailureHandler = null;
  });

  it("attaches auth headers when token exists", async () => {
    setStoredAccessToken("test-token");

    await apiClient.get("/example", { adapter } as any);

    expect(adapter).toHaveBeenCalledOnce();
    const passedConfig = adapter.mock.calls[0][0];
    expect(passedConfig?.headers?.Authorization).toBe("Bearer test-token");
    expect(buildRequestUrl(passedConfig ?? {})).toMatch(/\/api\/example$/);
  });

  it("reports missing tokens without redirecting", async () => {
    await expect(apiClient.get("/secure", { adapter } as any)).rejects.toBeDefined();

    expect(failureHandler).toHaveBeenCalledWith("missing-token");
    expect(redirectToLogin).not.toHaveBeenCalled();
  });

  it("reports unauthorized responses without redirecting", async () => {
    setStoredAccessToken("test-token");
    const unauthorizedAdapter = vi.fn(async (config) => ({
      data: {},
      status: 401,
      statusText: "Unauthorized",
      headers: {},
      config
    }));

    await expect(apiClient.get("/secure", { adapter: unauthorizedAdapter } as any)).rejects.toBeDefined();

    expect(failureHandler).toHaveBeenCalledWith("unauthorized");
    expect(redirectToLogin).not.toHaveBeenCalled();
  });

  it("adds idempotency and content type headers for mutating requests", async () => {
    setStoredAccessToken("test-token");

    await apiClient.post("/example", { name: "Atlas" }, { adapter } as any);

    expect(adapter).toHaveBeenCalledOnce();
    const passedConfig = adapter.mock.calls[0][0];
    expect(passedConfig?.headers?.["Content-Type"]).toBe("application/json");
    expect(passedConfig?.headers?.["Idempotency-Key"]).toBeDefined();
  });

  it("skips idempotency when skipAuth is true", async () => {
    await apiClient.post("/example", { name: "Atlas" }, { adapter, skipAuth: true } as any);

    expect(adapter).toHaveBeenCalledOnce();
    const passedConfig = adapter.mock.calls[0][0];
    expect(passedConfig?.headers?.["Idempotency-Key"]).toBeUndefined();
  });
});
