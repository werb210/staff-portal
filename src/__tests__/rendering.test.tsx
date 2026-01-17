// @vitest-environment jsdom
import { beforeEach, describe, expect, it, vi } from "vitest";
import { screen, waitFor } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { renderWithProviders } from "@/test/testUtils";
import LendersPage from "@/pages/lenders/LendersPage";
import { fetchLenders } from "@/api/lenders";

vi.mock("@/api/lenders", () => ({
  fetchLenders: vi.fn()
}));

const fetchLendersMock = vi.mocked(fetchLenders);

const renderAsAdmin = () =>
  renderWithProviders(
    <MemoryRouter initialEntries={["/lenders"]}>
      <Routes>
        <Route path="/lenders/*" element={<LendersPage />} />
      </Routes>
    </MemoryRouter>,
    {
      auth: {
        user: { id: "u-1", name: "Admin User", email: "admin@example.com", role: "Admin" },
        token: "token",
        status: "authenticated",
        authenticated: true,
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
        active: boolean;
        address: {
          street: string;
          city: string;
          stateProvince: string;
          postalCode: string;
          country: string;
        };
        phone: string;
        website?: string | null;
        description?: string | null;
        internalNotes?: string | null;
        processingNotes?: string | null;
        primaryContact: {
          name: string;
          email: string;
          phone: string;
          mobilePhone: string;
        };
        submissionConfig: {
          method: "API" | "EMAIL" | "MANUAL";
          apiBaseUrl?: string | null;
          apiClientId?: string | null;
          apiUsername?: string | null;
          apiPassword?: string | null;
          submissionEmail?: string | null;
        };
        operationalLimits: {
          maxLendingLimit?: number | null;
          maxLtv?: number | null;
          maxLoanTerm?: number | null;
          maxAmortization?: number | null;
        };
      }[]
    ) => void;
    const pending = new Promise<
      {
        id: string;
        name: string;
        active: boolean;
        address: {
          street: string;
          city: string;
          stateProvince: string;
          postalCode: string;
          country: string;
        };
        phone: string;
        website?: string | null;
        description?: string | null;
        internalNotes?: string | null;
        processingNotes?: string | null;
        primaryContact: {
          name: string;
          email: string;
          phone: string;
          mobilePhone: string;
        };
        submissionConfig: {
          method: "API" | "EMAIL" | "MANUAL";
          apiBaseUrl?: string | null;
          apiClientId?: string | null;
          apiUsername?: string | null;
          apiPassword?: string | null;
          submissionEmail?: string | null;
        };
        operationalLimits: {
          maxLendingLimit?: number | null;
          maxLtv?: number | null;
          maxLoanTerm?: number | null;
          maxAmortization?: number | null;
        };
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
        active: true,
        address: {
          street: "100 Market St",
          city: "Chicago",
          stateProvince: "IL",
          postalCode: "60601",
          country: "US"
        },
        phone: "312-555-0100",
        website: "https://atlas.example.com",
        description: "Commercial lending focus",
        internalNotes: null,
        processingNotes: null,
        primaryContact: {
          name: "Taylor Reed",
          email: "taylor@atlas.example.com",
          phone: "312-555-0200",
          mobilePhone: "312-555-0300"
        },
        submissionConfig: {
          method: "EMAIL",
          submissionEmail: "submissions@atlas.example.com",
          apiBaseUrl: null,
          apiClientId: null,
          apiUsername: null,
          apiPassword: null
        },
        operationalLimits: {
          maxLendingLimit: 500000,
          maxLtv: 80,
          maxLoanTerm: 60,
          maxAmortization: 84
        }
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
      <MemoryRouter initialEntries={["/lenders"]}>
        <Routes>
          <Route path="/lenders/*" element={<LendersPage />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(fetchLenders).toHaveBeenCalledTimes(1);
    });
  });
});
