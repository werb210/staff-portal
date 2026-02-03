// @vitest-environment jsdom
import { beforeEach, describe, expect, it, vi } from "vitest";

const pendingLog = {
  id: "call-pending",
  callId: "call-pending",
  contactId: "c1",
  applicationId: "app-1",
  number: "+15555550123",
  durationSeconds: 0,
  outcome: null,
  status: "dialing",
  startedAt: new Date("2024-01-01T00:00:00.000Z").toISOString(),
  endedAt: null,
  failureReason: null,
  recordingUrl: null,
  isPending: true
};

describe("dialer persistence", () => {
  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
  });

  it("flushes pending call logs on reload when no active session", async () => {
    localStorage.setItem("dialer-call-logs-v1", JSON.stringify([pendingLog]));
    sessionStorage.removeItem("dialer-session-v1");

    vi.resetModules();
    const { useDialerStore } = await import("@/state/dialer.store");

    const latest = useDialerStore.getState().logs[0];
    expect(latest.isPending).toBe(false);
    expect(latest.outcome).toBe("canceled");
    expect(latest.status).toBe("failed");
  });
});
