import { beforeEach, describe, expect, it, vi } from "vitest";
import apiClient from "./client";

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
  });

  it("throws before sending a request when the token is missing", async () => {
    await expect(
      apiClient.get("/example", { adapter } as any)
    ).rejects.toThrow("Missing access token");

    expect(adapter).not.toHaveBeenCalled();
  });

  it("attaches the bearer token to outbound requests", async () => {
    localStorage.setItem("accessToken", "abc123");

    await apiClient.get("/example", { adapter } as any);

    expect(adapter).toHaveBeenCalledOnce();
    const passedConfig = adapter.mock.calls[0][0];
    expect(passedConfig?.headers?.Authorization).toBe("Bearer abc123");
  });
});
