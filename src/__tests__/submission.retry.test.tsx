// @vitest-environment jsdom
import "@testing-library/jest-dom/vitest";
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import LendersTab from "@/pages/applications/drawer/tab-lenders/LendersTab";
import { renderWithProviders } from "@/test/testUtils";
import { useApplicationDrawerStore } from "@/state/applicationDrawer.store";
import { fetchLenderMatches, fetchLenderSubmissions, retryLenderSubmission } from "@/api/lenders";

vi.mock("@/api/lenders", () => ({
  fetchLenderMatches: vi.fn(),
  fetchLenderSubmissions: vi.fn(),
  retryLenderSubmission: vi.fn(),
  createLenderSubmission: vi.fn(),
  retryLenderTransmission: vi.fn()
}));

const createDeferred = () => {
  let resolve: (value?: unknown) => void = () => undefined;
  const promise = new Promise((res) => {
    resolve = res;
  });
  return { promise, resolve };
};

describe("submission retry", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useApplicationDrawerStore.setState({ isOpen: true, selectedApplicationId: "app-123", selectedTab: "lenders" });
  });

  it("shows retry only for failed submissions", async () => {
    vi.mocked(fetchLenderMatches).mockResolvedValue([{ id: "prod-1", lenderName: "Atlas Bank" }]);
    vi.mocked(fetchLenderSubmissions).mockResolvedValue([
      {
        id: "sub-1",
        lenderProductId: "prod-1",
        status: "sent",
        updatedAt: "2024-01-01T12:00:00Z",
        method: "API"
      }
    ]);

    renderWithProviders(<LendersTab />);

    expect(await screen.findByText("Submissions")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /Retry submission/i })).not.toBeInTheDocument();
  });

  it("optimistically updates status when retrying a failed submission", async () => {
    const deferred = createDeferred();
    vi.mocked(fetchLenderMatches).mockResolvedValue([{ id: "prod-1", lenderName: "Atlas Bank" }]);
    vi.mocked(fetchLenderSubmissions).mockResolvedValue([
      {
        id: "sub-1",
        lenderProductId: "prod-1",
        status: "failed",
        updatedAt: "2024-01-01T12:00:00Z",
        method: "EMAIL"
      }
    ]);
    vi.mocked(retryLenderSubmission).mockReturnValue(deferred.promise as Promise<unknown>);

    renderWithProviders(<LendersTab />);

    await userEvent.click(await screen.findByRole("button", { name: /Retry submission/i }));
    await userEvent.click(screen.getByRole("button", { name: /Confirm retry/i }));

    expect(screen.getByText("Pending")).toBeInTheDocument();

    deferred.resolve({ ok: true });
    await waitFor(() => expect(retryLenderSubmission).toHaveBeenCalled());
  });
});
