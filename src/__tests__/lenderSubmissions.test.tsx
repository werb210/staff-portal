// @vitest-environment jsdom
import { beforeEach, describe, expect, it, vi } from "vitest";
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderWithProviders } from "@/test/testUtils";
import { useApplicationDrawerStore } from "@/state/applicationDrawer.store";
import LendersTab from "@/pages/applications/drawer/tab-lenders/LendersTab";
import { createLenderSubmission, fetchLenderMatches } from "@/api/lenders";

vi.mock("@/api/lenders", () => ({
  fetchLenderMatches: vi.fn(),
  fetchLenderSubmissions: vi.fn(),
  createLenderSubmission: vi.fn(),
  retryLenderSubmission: vi.fn(),
  retryLenderTransmission: vi.fn()
}));

describe("lender submissions tab", () => {
  beforeEach(() => {
    useApplicationDrawerStore.setState({ isOpen: true, selectedApplicationId: "app-1", selectedTab: "lenders" });
    vi.clearAllMocks();
  });

  it("submits selected lenders from the single list", async () => {
    vi.mocked(fetchLenderMatches).mockResolvedValue([{ id: "prod-1", lenderName: "Atlas Bank" }]);
    vi.mocked(createLenderSubmission).mockResolvedValue(undefined);

    renderWithProviders(<LendersTab />);

    await userEvent.click(await screen.findByRole("checkbox"));
    await userEvent.click(screen.getByRole("button", { name: "Send" }));

    await waitFor(() => {
      expect(createLenderSubmission).toHaveBeenCalledWith("app-1", ["prod-1"]);
    });
  });
});
