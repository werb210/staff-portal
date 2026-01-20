import { beforeEach, describe, expect, it, vi } from "vitest";

describe("otp client", () => {
  beforeEach(() => {
    vi.resetModules();
  });

  it("starts otp requests with base url and request id header", async () => {
    const client = await import("@/api/client");
    const apiInstance = client.default;

    const apiPostSpy = vi
      .spyOn(apiInstance, "post")
      .mockResolvedValue({ data: null } as any);

    await client.otpStart({ phone: "+15555550100" });

    expect(apiInstance.defaults.baseURL).toBe(import.meta.env.VITE_API_BASE_URL);
    expect(apiPostSpy).toHaveBeenCalledWith("/auth/otp/start", { phone: "+15555550100" });

    const requestHandler = apiInstance.interceptors.request.handlers[0]?.fulfilled;
    const config = requestHandler ? requestHandler({ headers: {} }) : null;
    expect(config?.headers?.["X-Request-Id"]).toBeTruthy();
  });
});
