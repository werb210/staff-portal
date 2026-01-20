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

let failureHandler: ReturnType<typeof vi.fn>;

const adapter = vi.fn(async (config) => ({
  data: {},
  status: 200,
  statusText: "OK",
  headers: {},
  config
}));

describe("apiClient auth", () => {
  beforeEach(() => {
    localStorage.clear();
    adapter.mockClear();
    failureHandler = vi.fn();
    registerAuthFailureHandler(failureHandler);
  });

  it("sends requests without auth headers", async () => {
    await apiClient.get("/example", { adapter } as any);

    expect(adapter).toHaveBeenCalledOnce();
    const passedConfig = adapter.mock.calls[0][0];
    expect(passedConfig?.headers?.Authorization).toBeUndefined();
    expect(passedConfig?.url).toBe(buildApiUrl("/example"));
  });

  it("redirects on 401 responses", async () => {
    const unauthorizedAdapter = vi.fn(async (config) => ({
      data: {},
      status: 401,
      statusText: "Unauthorized",
      headers: {},
      config
    }));

    await expect(apiClient.get("/secure", { adapter: unauthorizedAdapter } as any)).rejects.toBeDefined();

    expect(failureHandler).toHaveBeenCalledWith("unauthorized");
    expect(redirectToLogin).toHaveBeenCalled();
  });

  it("adds idempotency and content type headers for mutating requests", async () => {
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
