// @vitest-environment jsdom
import "@testing-library/jest-dom/vitest";
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import LendersTab from "@/pages/applications/drawer/tab-lenders/LendersTab";
import { renderWithProviders } from "@/test/testUtils";
import { useApplicationDrawerStore } from "@/state/applicationDrawer.store";
import { createLenderSubmission, fetchLenderMatches, fetchLenderSubmissions } from "@/api/lenders";

vi.mock("@/api/lenders", () => ({
  fetchLenderMatches: vi.fn(),
  fetchLenderSubmissions: vi.fn(),
  createLenderSubmission: vi.fn(),
  retryLenderTransmission: vi.fn(),
  retryLenderSubmission: vi.fn()
}));

describe("pipeline submission", () => {
  beforeEach(() => {
    useApplicationDrawerStore.setState({ isOpen: true, selectedApplicationId: "app-55", selectedTab: "lenders" });
    vi.clearAllMocks();
  });

  it("confirms Google Sheet submissions before sending", async () => {
    vi.mocked(fetchLenderMatches).mockResolvedValue([
      { id: "prod-1", lenderName: "Sheet Lender", submissionMethod: "GOOGLE_SHEET" }
    ]);
    vi.mocked(fetchLenderSubmissions).mockResolvedValue([]);
    vi.mocked(createLenderSubmission).mockResolvedValue(undefined);

    renderWithProviders(<LendersTab />);

    await waitFor(() => {
      expect(screen.getByText("Sheet Lender")).toBeInTheDocument();
    });

    await userEvent.click(screen.getByRole("checkbox"));
    await userEvent.click(screen.getByRole("button", { name: "Send to Lender" }));

    expect(screen.getByText(/submit the application to the lender’s Google Sheet/i)).toBeInTheDocument();

    await userEvent.click(screen.getByRole("button", { name: /Confirm/i }));

    await waitFor(() => {
      expect(createLenderSubmission).toHaveBeenCalledWith("app-55", ["prod-1"]);
    });
  });
});
