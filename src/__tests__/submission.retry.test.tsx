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
  retryLenderSubmission: vi.fn(),
  createLenderSubmission: vi.fn(),
  retryLenderTransmission: vi.fn()
}));

describe("submission retry", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useApplicationDrawerStore.setState({ isOpen: true, selectedApplicationId: "app-123", selectedTab: "lenders" });
  });

  it("disables send while sending", async () => {
    vi.mocked(fetchLenderMatches).mockResolvedValue([{ id: "prod-1", lenderName: "Atlas Bank" }]);
    let resolveRequest: (() => void) | undefined;
    vi.mocked(createLenderSubmission).mockImplementation(
      () =>
        new Promise((resolve) => {
          resolveRequest = resolve as () => void;
        })
    );

    renderWithProviders(<LendersTab />);

    await userEvent.click(await screen.findByRole("checkbox"));
    const sendButton = screen.getByRole("button", { name: "Send" });
    await userEvent.click(sendButton);

    expect(sendButton).toBeDisabled();
    resolveRequest?.();
    await waitFor(() => expect(createLenderSubmission).toHaveBeenCalledTimes(1));
  });
});
