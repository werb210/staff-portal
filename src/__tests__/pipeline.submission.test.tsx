// @vitest-environment jsdom
import "@testing-library/jest-dom/vitest";
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import LendersTab from "@/pages/applications/drawer/tab-lenders/LendersTab";
import { renderWithProviders } from "@/test/testUtils";
import { useApplicationDrawerStore } from "@/state/applicationDrawer.store";
import { createLenderSubmission, fetchLenderMatches } from "@/api/lenders";

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

  it("sends selected lenders without duplicate submit affordances", async () => {
    vi.mocked(fetchLenderMatches).mockResolvedValue([{ id: "prod-1", lenderName: "Sheet Lender" }]);
    vi.mocked(createLenderSubmission).mockResolvedValue(undefined);

    renderWithProviders(<LendersTab />);

    await userEvent.click(await screen.findByRole("checkbox"));
    await userEvent.click(screen.getByRole("button", { name: "Send" }));

    await waitFor(() => {
      expect(createLenderSubmission).toHaveBeenCalledWith("app-55", ["prod-1"]);
    });
  });
});
