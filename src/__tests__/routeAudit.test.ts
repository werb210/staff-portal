// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/services/token", () => ({
  getStoredAccessToken: vi.fn(() => null)
}));

import { clearUiFailure, getUiFailure } from "@/utils/uiFailureStore";
import { runRouteAudit } from "@/utils/routeAudit";

const fetchMock = vi.fn();

describe("route audit", () => {
  beforeEach(() => {
    clearUiFailure();
    fetchMock.mockReset();
    vi.stubGlobal("fetch", fetchMock);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("does not throw or set ui failure when audit fetch fails", async () => {
    fetchMock.mockRejectedValue(new Error("network down"));

    await expect(runRouteAudit()).resolves.toBeUndefined();

    expect(getUiFailure()).toBeNull();
  });
});
