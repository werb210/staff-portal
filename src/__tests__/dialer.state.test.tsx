// @vitest-environment jsdom
import "@testing-library/jest-dom/vitest";
import { afterEach, describe, expect, it } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import VoiceDialer from "@/components/dialer/VoiceDialer";
import { useDialerStore } from "@/state/dialer.store";

const resetDialerStore = () => {
  useDialerStore.setState(
    {
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
    },
    true
  );
};

describe("dialer state persistence", () => {
  afterEach(() => {
    cleanup();
    resetDialerStore();
  });

  it("keeps dialer state across remounts", () => {
    useDialerStore.setState({
      isOpen: true,
      status: "connected",
      number: "+15555550123",
      context: { contactName: "Taylor" },
      elapsedSeconds: 42
    });

    const { unmount } = render(<VoiceDialer />);

    expect(screen.getByDisplayValue("+15555550123")).toBeInTheDocument();
    expect(screen.getByText("Connected")).toBeInTheDocument();

    unmount();

    render(<VoiceDialer />);

    expect(screen.getByDisplayValue("+15555550123")).toBeInTheDocument();
    expect(screen.getByText("Connected")).toBeInTheDocument();
  });
});
