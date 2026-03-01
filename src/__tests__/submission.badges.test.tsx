// @vitest-environment jsdom
import "@testing-library/jest-dom/vitest";
import { screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import LendersTab from "@/pages/applications/drawer/tab-lenders/LendersTab";
import { renderWithProviders } from "@/test/testUtils";
import { useApplicationDrawerStore } from "@/state/applicationDrawer.store";
import { fetchLenderMatches } from "@/api/lenders";

vi.mock("@/api/lenders", () => ({
  fetchLenderMatches: vi.fn(),
  fetchLenderSubmissions: vi.fn(),
  fetchLenderProductById: vi.fn(),
  fetchLenders: vi.fn(),
  fetchClientLenderProductRequirements: vi.fn(),
  createLenderSubmission: vi.fn(),
  retryLenderTransmission: vi.fn(),
  retryLenderSubmission: vi.fn()
}));

describe("submission badges", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useApplicationDrawerStore.setState({ isOpen: true, selectedApplicationId: "app-123", selectedTab: "lenders" });
  });

  it("renders lender rows with upload controls", async () => {
    vi.mocked(fetchLenderMatches).mockResolvedValue([{ id: "prod-1", lenderName: "Atlas Bank", matchPercentage: 66 }]);

    renderWithProviders(<LendersTab />);

    expect(await screen.findByText("Atlas Bank")).toBeInTheDocument();
    expect(screen.getByText("Likelihood: 66%")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Upload Term Sheet" })).toBeInTheDocument();
  });
});
