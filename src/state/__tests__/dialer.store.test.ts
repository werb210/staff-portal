import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import { act } from "@testing-library/react";
import { useDialerStore } from "@/state/dialer.store";

const resetStore = () => {
  useDialerStore.setState({
    isOpen: false,
    isMinimized: false,
    context: {},
    status: "idle",
    muted: false,
    onHold: false,
    keypadOpen: false,
    number: "",
    dialedNumber: null,
    error: null,
    startedAt: null,
    elapsedSeconds: 0,
    logs: []
  });
};

describe("dialer store", () => {
  beforeEach(() => {
    resetStore();
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2024-01-01T00:00:00.000Z"));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("opens with context and starts a call", () => {
    act(() => {
      useDialerStore.getState().openDialer({ contactId: "c1", contactName: "Jane", phone: "+1" });
    });

    const state = useDialerStore.getState();
    expect(state.isOpen).toBe(true);
    expect(state.number).toBe("+1");

    act(() => {
      useDialerStore.getState().startCall();
    });

    expect(useDialerStore.getState().status).toBe("dialing");
  });

  it("records call metadata on end", () => {
    act(() => {
      useDialerStore.getState().openDialer({ applicationId: "app-1" });
      useDialerStore.getState().setNumber("555-0100");
      useDialerStore.getState().startCall();
      useDialerStore.getState().setStatus("connected");
    });

    vi.advanceTimersByTime(32000);

    const log = useDialerStore.getState().endCall("completed");
    const latest = useDialerStore.getState().logs[0];
    expect(latest.number).toBe("555-0100");
    expect(latest.outcome).toBe("completed");
    expect(latest.applicationId).toBe("app-1");
    expect(log).not.toBeNull();
  });
});
