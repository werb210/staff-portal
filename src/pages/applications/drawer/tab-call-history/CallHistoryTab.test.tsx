import { describe, it, expect, vi, beforeEach } from "vitest";
import { screen } from "@testing-library/react";
import { renderWithProviders } from "@/test/testUtils";
import { useApplicationDrawerStore } from "@/state/applicationDrawer.store";
import CallHistoryTab from "@/pages/applications/drawer/tab-call-history/CallHistoryTab";
import { fetchCallHistory } from "@/api/dialer";

vi.mock("@/api/dialer", () => ({
  fetchCallHistory: vi.fn(),
  fetchStaffCallStats: vi.fn()
}));

describe("CallHistoryTab", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useApplicationDrawerStore.setState({ isOpen: true, selectedApplicationId: "app-123", selectedTab: "call-history" });
  });

  it("renders call tab timeline rows when call logs exist", async () => {
    vi.mocked(fetchCallHistory).mockResolvedValue({
      data: [
        {
          id: "call-1",
          created_at: new Date().toISOString(),
          direction: "inbound",
          staff_name: "Alex",
          duration_seconds: 75,
          outcome: "completed",
          voicemail_url: null,
          recording_url: "https://example.com/recording.mp3"
        }
      ]
    } as any);

    renderWithProviders(<CallHistoryTab />);

    expect(await screen.findByTestId("call-history-list")).toBeInTheDocument();
    expect(screen.getByText("Staff: Alex")).toBeInTheDocument();
    expect(screen.getByText("Play recording")).toBeInTheDocument();
  });

  it("renders voicemail audio for staff roles when voicemail url exists", async () => {
    vi.mocked(fetchCallHistory).mockResolvedValue({
      data: [
        {
          id: "call-2",
          created_at: new Date().toISOString(),
          direction: "outbound",
          staff_name: "Taylor",
          duration_seconds: 45,
          outcome: "no-answer",
          voicemail_url: "https://example.com/voicemail.mp3"
        }
      ]
    } as any);

    const { container } = renderWithProviders(<CallHistoryTab />, { role: "Staff" });

    await screen.findByText("Staff: Taylor");
    expect(container.querySelector("audio")).toBeInTheDocument();
  });

  it("enforces role guard for voicemail player", async () => {
    vi.mocked(fetchCallHistory).mockResolvedValue({
      data: [
        {
          id: "call-3",
          created_at: new Date().toISOString(),
          direction: "inbound",
          staff_name: "Jamie",
          duration_seconds: 10,
          outcome: "failed",
          voicemail_url: "https://example.com/private-voicemail.mp3"
        }
      ]
    } as any);

    const { container } = renderWithProviders(<CallHistoryTab />, { role: "Viewer" });

    await screen.findByText("Staff: Jamie");
    expect(container.querySelector("audio")).not.toBeInTheDocument();
  });
});
