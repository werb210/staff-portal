import { beforeEach, describe, expect, it, vi } from "vitest";
import apiClient from "@/api/httpClient";
import { ApiError } from "@/api/http";
import { buildApiUrl, redirectToLogin } from "@/services/api";
import { registerAuthFailureHandler } from "@/auth/authEvents";

vi.mock("@/services/api", async () => {
  const actual = await vi.importActual<typeof import("@/services/api")>("@/services/api");
  return {
    ...actual,
    redirectToLogin: vi.fn()
  };
});

describe("api client auth handling", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("does not attach auth headers", async () => {
    const adapter = vi.fn(async (config) => ({
      data: {},
      status: 200,
      statusText: "OK",
      headers: {},
      config
    }));

    await apiClient.get("/example", { adapter } as any);

    expect(adapter).toHaveBeenCalledOnce();
    const passedConfig = adapter.mock.calls[0][0];
    expect(passedConfig?.headers?.Authorization).toBeUndefined();
    expect(passedConfig?.url).toBe(buildApiUrl("/example"));
  });

  it("adds an idempotency key to write requests", async () => {
    const adapter = vi.fn(async (config) => ({
      data: {},
      status: 200,
      statusText: "OK",
      headers: {},
      config
    }));

    await apiClient.post("/example", { name: "test" }, { adapter } as any);

    const passedConfig = adapter.mock.calls[0][0];
    expect(passedConfig?.headers?.["Idempotency-Key"]).toBeTruthy();
  });

  it("redirects on 401 responses", async () => {
    const failureHandler = vi.fn();
    registerAuthFailureHandler(failureHandler);

    const adapter = vi.fn(async (config) => ({
      data: {},
      status: 401,
      statusText: "Unauthorized",
      headers: {},
      config
    }));

    await expect(apiClient.get("/secure", { adapter } as any)).rejects.toBeInstanceOf(ApiError);

    expect(failureHandler).toHaveBeenCalledWith("unauthorized");
    expect(redirectToLogin).toHaveBeenCalled();
  });
});
