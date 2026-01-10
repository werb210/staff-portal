import { beforeEach, describe, expect, it, vi } from "vitest";
import apiClient, { ApiError } from "@/api/client";
import { buildApiUrl } from "@/services/api";
import { registerAuthFailureHandler } from "@/auth/authEvents";

describe("api client auth handling", () => {
  beforeEach(() => {
    sessionStorage.clear();
  });

  it("attaches tokens to requests", async () => {
    sessionStorage.setItem("accessToken", "abc123");

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
    expect(passedConfig?.headers?.Authorization).toBe("Bearer abc123");
    expect(passedConfig?.url).toBe(buildApiUrl("/example"));
  });

  it("adds an idempotency key to write requests", async () => {
    sessionStorage.setItem("accessToken", "abc123");

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

  it("refreshes once on 401 responses", async () => {
    sessionStorage.setItem("accessToken", "expired-token");
    sessionStorage.setItem("refreshToken", "refresh-token");

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

    const secureRequests = adapter.mock.calls.filter(([callConfig]) => String(callConfig.url).includes("/secure"));
    expect(secureRequests).toHaveLength(2);
    expect(secureRequests[1][0]?.headers?.Authorization).toBe("Bearer new-token");
  });

  it("logs out after a second 401 response", async () => {
    sessionStorage.setItem("accessToken", "expired-token");
    sessionStorage.setItem("refreshToken", "refresh-token");

    const failureHandler = vi.fn();
    registerAuthFailureHandler(failureHandler);

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

    await expect(apiClient.get("/secure", { adapter } as any)).rejects.toBeInstanceOf(ApiError);

    expect(failureHandler).toHaveBeenCalledWith("unauthorized");
  });
});
