// @vitest-environment jsdom
import { beforeEach, describe, expect, it, vi } from "vitest";
import { screen, waitFor } from "@testing-library/react";
import { renderWithProviders } from "@/test/testUtils";
import LendersPage from "@/pages/lenders/LendersPage";
import { fetchLenders } from "@/api/lenders";

vi.mock("@/api/lenders", () => ({
  fetchLenders: vi.fn()
}));

const fetchLendersMock = vi.mocked(fetchLenders);

const renderAsAdmin = () =>
  renderWithProviders(<LendersPage />, {
    auth: {
      user: { id: "u-1", name: "Admin User", email: "admin@example.com", role: "Admin" },
      token: "token",
      status: "authenticated",
      authReady: true
    }
  });

describe("loading and empty-state rendering", () => {
  beforeEach(() => {
    fetchLendersMock.mockReset();
  });

  it("renders an empty state for empty datasets", async () => {
    fetchLendersMock.mockResolvedValueOnce([]);

    renderAsAdmin();

    await waitFor(() => {
      expect(screen.getByText("No lender profiles available.")).toBeInTheDocument();
    });
  });

  it("transitions from loading to data", async () => {
    let resolvePromise: (value: { id: string; name: string; region: string }[]) => void;
    const pending = new Promise<{ id: string; name: string; region: string }[]>((resolve) => {
      resolvePromise = resolve;
    });

    fetchLendersMock.mockReturnValueOnce(pending);

    renderAsAdmin();

    expect(screen.getByText("Loading experience...")).toBeInTheDocument();

    resolvePromise!([{ id: "l-1", name: "Atlas Bank", region: "Midwest" }]);

    await waitFor(() => {
      expect(screen.getByText("Atlas Bank")).toBeInTheDocument();
    });
  });

  it("avoids duplicate fetches on re-render", async () => {
    fetchLendersMock.mockResolvedValueOnce([]);

    const { rerender } = renderAsAdmin();

    await waitFor(() => {
      expect(fetchLenders).toHaveBeenCalledTimes(1);
    });

    rerender(<LendersPage />);

    await waitFor(() => {
      expect(fetchLenders).toHaveBeenCalledTimes(1);
    });
  });
});
