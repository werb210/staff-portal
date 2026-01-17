// @vitest-environment jsdom
import { beforeEach, describe, expect, it, vi } from "vitest";
import { screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { renderWithProviders } from "@/test/testUtils";
import LendersPage from "@/pages/lenders/LendersPage";
import { fetchLenders } from "@/api/lenders";
import { FUNDING_TYPES } from "@/types/lenderManagement.types";

vi.mock("@/api/lenders", () => ({
  fetchLenders: vi.fn()
}));

const fetchLendersMock = vi.mocked(fetchLenders);

const renderAsAdmin = () =>
  renderWithProviders(
    <MemoryRouter>
      <LendersPage />
    </MemoryRouter>,
    {
    auth: {
      user: { id: "u-1", name: "Admin User", email: "admin@example.com", role: "Admin" },
      token: "token",
      status: "authenticated",
      authReady: true
    }
    }
  );

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
    let resolvePromise: (
      value: {
        id: string;
        name: string;
        status: "active" | "paused";
        regions: string[];
        industries: string[];
        minDealAmount: number;
        maxDealAmount: number;
        fundingTypes: string[];
        internalNotes?: string | null;
        clientVisible: boolean;
      }[]
    ) => void;
    const pending = new Promise<
      {
        id: string;
        name: string;
        status: "active" | "paused";
        regions: string[];
        industries: string[];
        minDealAmount: number;
        maxDealAmount: number;
        fundingTypes: string[];
        internalNotes?: string | null;
        clientVisible: boolean;
      }[]
    >((resolve) => {
      resolvePromise = resolve;
    });

    fetchLendersMock.mockReturnValueOnce(pending);

    renderAsAdmin();

    expect(screen.getByText("Loading experience...")).toBeInTheDocument();

    resolvePromise!([
      {
        id: "l-1",
        name: "Atlas Bank",
        status: "active",
        regions: ["Midwest"],
        industries: ["Retail"],
        minDealAmount: 25000,
        maxDealAmount: 250000,
        fundingTypes: [FUNDING_TYPES[1]],
        internalNotes: null,
        clientVisible: true
      }
    ]);

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

    rerender(
      <MemoryRouter>
        <LendersPage />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(fetchLenders).toHaveBeenCalledTimes(1);
    });
  });
});
