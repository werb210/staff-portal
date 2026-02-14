// @vitest-environment jsdom
import { beforeEach, describe, expect, it, vi } from "vitest";
import userEvent from "@testing-library/user-event";
import { screen, waitFor } from "@testing-library/react";
import LiveChatPanel from "@/features/chat/LiveChatPanel";
import { renderWithProviders } from "@/test/testUtils";
import {
  applyHumanActiveState,
  closeEscalatedChat,
  fetchCommunicationThreads,
  sendCommunication,
  type CommunicationConversation
} from "@/api/communications";

vi.mock("@/api/communications", () => ({
  fetchCommunicationThreads: vi.fn(),
  applyHumanActiveState: vi.fn(),
  sendCommunication: vi.fn(),
  closeEscalatedChat: vi.fn()
}));

vi.mock("@/services/aiSocket", () => ({
  reconnectAiSocket: vi.fn(),
  subscribeAiSocket: vi.fn(() => () => undefined),
  subscribeAiSocketConnection: vi.fn((listener: (state: "connected") => void) => {
    listener("connected");
    return () => undefined;
  })
}));

const thread: CommunicationConversation = {
  id: "conv-chat-1",
  sessionId: "chat-session-1001",
  contactName: "Jane Client",
  type: "chat",
  createdAt: "2025-01-01T00:00:00Z",
  updatedAt: "2025-01-01T00:00:00Z",
  silo: "BF",
  messages: [
    {
      id: "msg-1",
      conversationId: "conv-chat-1",
      direction: "in",
      message: "Need help",
      createdAt: "2025-01-01T00:00:00Z",
      type: "chat",
      silo: "BF"
    }
  ]
};

describe("LiveChatPanel", () => {
  beforeEach(() => {
    vi.mocked(fetchCommunicationThreads).mockReset();
    vi.mocked(applyHumanActiveState).mockReset();
    vi.mocked(sendCommunication).mockReset();
    vi.mocked(closeEscalatedChat).mockReset();
  });

  it("loads chat sessions and allows joining and replying", async () => {
    vi.mocked(fetchCommunicationThreads).mockResolvedValue([thread]);
    vi.mocked(applyHumanActiveState).mockResolvedValue({ ...thread, status: "human", metadata: { aiPaused: true } });
    vi.mocked(sendCommunication).mockResolvedValue({
      id: "msg-2",
      conversationId: thread.id,
      direction: "out",
      message: "Transferring you…",
      createdAt: "2025-01-01T00:01:00Z",
      type: "system",
      silo: "BF"
    });

    renderWithProviders(<LiveChatPanel />);

    await waitFor(() => {
      expect(screen.getAllByText("Jane Client").length).toBeGreaterThan(0);
    });
    expect(screen.getByText("Staff presence: Online")).toBeInTheDocument();

    await userEvent.click(screen.getByRole("button", { name: "Join" }));
    await waitFor(() => {
      expect(applyHumanActiveState).toHaveBeenCalledWith(thread.id);
      expect(sendCommunication).toHaveBeenCalledWith(thread.id, "Transferring you…", "system");
    });

    await userEvent.type(screen.getByPlaceholderText("Reply to client"), "On it");
    await userEvent.click(screen.getByRole("button", { name: "Send" }));

    await waitFor(() => {
      expect(sendCommunication).toHaveBeenCalledWith(thread.id, "On it", "human");
    });
  });
});
