// @vitest-environment jsdom
import "@testing-library/jest-dom/vitest";
import { act, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import VoiceDialer from "@/components/dialer/VoiceDialer";
import { useDialerStore } from "@/state/dialer.store";
import { renderWithProviders } from "@/test/testUtils";

const resetDialer = () => {
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

let callHandlers: Record<string, (...args: any[]) => void> = {};

vi.mock("@/services/twilioVoice", () => {
  const fakeCall = {
    on: (event: string, handler: (...args: any[]) => void) => {
      callHandlers[event] = handler;
    },
    disconnect: vi.fn()
  };

  const fakeDevice = {
    connect: vi.fn(async () => fakeCall)
  };

  return {
    fetchTwilioToken: vi.fn(async () => "token"),
    createTwilioDevice: vi.fn(() => fakeDevice)
  };
});

describe("VoiceDialer", () => {
  beforeEach(() => {
    callHandlers = {};
    resetDialer();
  });

  it("opens and closes from the store", async () => {
    renderWithProviders(<VoiceDialer />);
    act(() => {
      useDialerStore.getState().openDialer({ contactName: "Jane Doe", phone: "+15555551212" });
    });
    expect(await screen.findByTestId("voice-dialer")).toBeInTheDocument();
    const closeButton = screen.getByRole("button", { name: /close dialer/i });
    await userEvent.click(closeButton);
    expect(screen.queryByTestId("voice-dialer")).not.toBeInTheDocument();
  });

  it("updates status as a call progresses", async () => {
    render(<VoiceDialer />);
    act(() => {
      useDialerStore.getState().openDialer({ contactName: "Jane Doe" });
    });
    const input = await screen.findByPlaceholderText("Enter phone number");
    await userEvent.type(input, "555-555-0100");
    await userEvent.click(screen.getByRole("button", { name: "Dial" }));
    expect(useDialerStore.getState().status).toBe("dialing");

    act(() => {
      callHandlers.ringing?.();
    });
    expect(await screen.findByText("Ringing…", { selector: ".dialer__status-pill" })).toBeInTheDocument();

    act(() => {
      callHandlers.accept?.();
    });
    expect(await screen.findByText("Connected")).toBeInTheDocument();

    act(() => {
      callHandlers.disconnect?.();
    });
    expect(await screen.findByText("Call ended")).toBeInTheDocument();
  });

  it("preserves dialer state across unmounts", async () => {
    const { unmount } = renderWithProviders(<VoiceDialer />);
    act(() => {
      useDialerStore.getState().openDialer({ contactName: "Jane Doe", phone: "+15555551212" });
    });
    expect(await screen.findByTestId("voice-dialer")).toBeInTheDocument();

    unmount();

    renderWithProviders(<VoiceDialer />);
    expect(await screen.findByTestId("voice-dialer")).toBeInTheDocument();
  });
});
