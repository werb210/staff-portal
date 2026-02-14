import { beforeAll, describe, expect, it, vi } from "vitest";
import { screen } from "@testing-library/react";
import { renderWithProviders } from "@/test/testUtils";
import AiChatDashboard from "@/pages/admin/AiChatDashboard";
import AiIssueReports from "@/pages/admin/AiIssueReports";

vi.mock("@/services/aiSocket", () => ({
  subscribeAiSocket: vi.fn(() => () => undefined)
}));

vi.mock("@/services/aiService", () => ({
  useAiChatsQuery: vi.fn(() => ({
    data: [
      {
        id: "chat-1",
        status: "Active",
        customerName: "Jane Customer",
        lastMessagePreview: "Need help",
        lastMessageAt: new Date().toISOString()
      }
    ],
    refetch: vi.fn()
  })),
  useAiChatQuery: vi.fn(() => ({
    data: {
      id: "chat-1",
      status: "Active",
      customerName: "Jane Customer",
      messages: [
        {
          id: "m-1",
          role: "user",
          content: "Hello",
          createdAt: new Date().toISOString()
        }
      ]
    },
    refetch: vi.fn()
  })),
  useSendStaffMessageMutation: vi.fn(() => ({
    mutateAsync: vi.fn(async () => undefined),
    isPending: false
  })),
  useCloseChatMutation: vi.fn(() => ({
    mutate: vi.fn(),
    isPending: false
  })),
  useAiIssuesQuery: vi.fn(() => ({
    data: [
      {
        id: "issue-1",
        status: "Open",
        pageUrl: "/applications",
        description: "Form submit stuck",
        screenshotUrl: "https://example.com/screen.png",
        createdAt: new Date().toISOString(),
        assignedTo: "Team A",
        browserInfo: "Chrome",
        chatSessionId: "chat-1"
      }
    ],
    isLoading: false
  })),
  useResolveIssueMutation: vi.fn(() => ({
    mutate: vi.fn()
  })),
  useDeleteIssueMutation: vi.fn(() => ({
    mutate: vi.fn()
  }))
}));

beforeAll(() => {
  window.HTMLElement.prototype.scrollIntoView = vi.fn();
});

describe("AI admin pages", () => {
  it("chat session renders", () => {
    renderWithProviders(<AiChatDashboard />, {
      auth: { user: { id: "2", email: "staff@example.com", role: "Staff", name: "Staff User" } }
    });

    expect(screen.getByText("AI Live Chat Dashboard")).toBeInTheDocument();
    expect(screen.getAllByText("Jane Customer").length).toBeGreaterThan(0);
    expect(screen.getByText("Hello")).toBeInTheDocument();
  });

  it("issue reports render", () => {
    renderWithProviders(<AiIssueReports />, {
      auth: { user: { id: "3", email: "staff@example.com", role: "Staff" } }
    });

    expect(screen.getByText("AI Issue Reports")).toBeInTheDocument();
    expect(screen.getByText("Form submit stuck")).toBeInTheDocument();
  });
});
