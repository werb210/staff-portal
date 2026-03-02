import { describe, it, expect, vi, beforeEach } from "vitest";
import { screen } from "@testing-library/react";
import { renderWithProviders } from "@/test/testUtils";
import CallPerformanceCard from "@/components/CallPerformanceCard";
import { fetchStaffCallStats } from "@/api/dialer";

vi.mock("@/api/dialer", () => ({
  fetchCallHistory: vi.fn(),
  fetchStaffCallStats: vi.fn()
}));

describe("CallPerformanceCard", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("loads and renders call performance metrics", async () => {
    vi.mocked(fetchStaffCallStats).mockResolvedValue({
      data: {
        totalCalls: 21,
        avgDurationSeconds: 180,
        missedCallPercent: 12.5,
        voicemailCount: 3
      }
    } as any);

    renderWithProviders(<CallPerformanceCard />);

    expect(await screen.findByText(/Total Calls \(7 days\): 21/)).toBeInTheDocument();
    expect(screen.getByText("Avg Duration: 3m")).toBeInTheDocument();
    expect(screen.getByText("Missed Call %: 12.5%")).toBeInTheDocument();
    expect(screen.getByText("Voicemail Count: 3")).toBeInTheDocument();
  });
});
