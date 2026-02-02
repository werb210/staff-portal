// @vitest-environment jsdom
import { beforeEach, describe, expect, it, vi } from "vitest";
import { screen, waitFor } from "@testing-library/react";
import MessagesTab from "@/pages/applications/drawer/tab-messages/MessagesTab";
import { renderWithProviders } from "@/test/testUtils";
import { useApplicationDrawerStore } from "@/state/applicationDrawer.store";
import { fetchMessagesThread, sendMessage } from "@/api/messages";

vi.mock("@/api/messages", () => ({
  fetchMessagesThread: vi.fn(),
  sendMessage: vi.fn()
}));

const fetchMessagesThreadMock = vi.mocked(fetchMessagesThread);

describe("messages thread", () => {
  beforeEach(() => {
    useApplicationDrawerStore.setState({
      isOpen: true,
      selectedApplicationId: "app-22",
      selectedTab: "notes"
    });
    fetchMessagesThreadMock.mockReset();
    vi.mocked(sendMessage).mockReset();
  });

  it("loads messages deterministically", async () => {
    fetchMessagesThreadMock.mockResolvedValueOnce([
      {
        id: "m-1",
        body: "Client sent a question.",
        senderName: "Client User",
        senderType: "client",
        source: "client",
        createdAt: "2024-03-01T09:00:00Z",
        status: "unread"
      },
      {
        id: "m-2",
        body: "Staff replied later.",
        senderName: "Staff Agent",
        senderType: "staff",
        source: "staff",
        createdAt: "2024-03-01T10:00:00Z",
        status: "read"
      }
    ]);

    renderWithProviders(<MessagesTab />);

    await waitFor(() => {
      expect(screen.getByText("Client sent a question.")).toBeInTheDocument();
      expect(screen.getByText("Staff replied later.")).toBeInTheDocument();
    });
  });
});
