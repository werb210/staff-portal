// @vitest-environment jsdom
import "@testing-library/jest-dom/vitest";
import { screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import LendersTab from "@/pages/applications/drawer/tab-lenders/LendersTab";
import { renderWithProviders } from "@/test/testUtils";
import { useApplicationDrawerStore } from "@/state/applicationDrawer.store";
import { fetchLenderMatches, fetchLenderSubmissions } from "@/api/lenders";

vi.mock("@/api/lenders", () => ({
  fetchLenderMatches: vi.fn(),
  fetchLenderSubmissions: vi.fn(),
  createLenderSubmission: vi.fn(),
  retryLenderTransmission: vi.fn(),
  retryLenderSubmission: vi.fn()
}));

describe("application drawer submissions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useApplicationDrawerStore.setState({ isOpen: true, selectedApplicationId: "app-123", selectedTab: "lenders" });
  });

  it("renders submission details and hides raw errors", async () => {
    vi.mocked(fetchLenderMatches).mockResolvedValue([{ id: "prod-1", lenderName: "Merchant Growth" }]);
    vi.mocked(fetchLenderSubmissions).mockResolvedValue([
      {
        id: "sub-1",
        lenderProductId: "prod-1",
        status: "failed",
        updatedAt: "2024-02-01T10:00:00Z",
        method: "GOOGLE_SHEET",
        externalReference: "Sheet Row #184",
        errorMessage: "Sensitive stack trace"
      }
    ]);

    renderWithProviders(<LendersTab />);

    expect(await screen.findByText("Submissions")).toBeInTheDocument();
    expect((await screen.findAllByText("Merchant Growth")).length).toBeGreaterThan(0);
    expect(screen.getByText("Sheet Row #184")).toBeInTheDocument();
    expect(screen.getAllByText("Submission failed — retry available").length).toBeGreaterThan(0);
    expect(screen.queryByText("Sensitive stack trace")).not.toBeInTheDocument();
  });
});
