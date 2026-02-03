// @vitest-environment jsdom
import "@testing-library/jest-dom/vitest";
import { render, screen, within } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";
import LenderProductsPage from "@/pages/lenders/LenderProductsPage";
import type { Lender } from "@/types/lenderManagement.models";
import { renderWithProviders } from "@/test/testUtils";
import { fetchLenderProducts, fetchLenders } from "@/api/lenders";

vi.mock("@/api/lenders", () => ({
  fetchLenders: vi.fn(),
  fetchLenderProducts: vi.fn(),
  createLenderProduct: vi.fn(),
  updateLenderProduct: vi.fn()
}));

const activeLender: Lender = {
  id: "l-active",
  name: "Active Lender",
  active: true,
  status: "ACTIVE",
  address: {
    street: "",
    city: "",
    stateProvince: "",
    postalCode: "",
    country: "US"
  },
  phone: "",
  website: null,
  description: null,
  internalNotes: null,
  processingNotes: null,
  primaryContact: {
    name: "",
    email: "",
    phone: "",
    mobilePhone: ""
  },
  submissionConfig: {
    method: "EMAIL",
    sheetId: null,
    worksheetName: null,
    mappingPreview: null,
    sheetStatus: null,
    attachmentFormat: "PDF",
    apiAuthType: null,
    apiBaseUrl: null,
    apiClientId: null,
    apiUsername: null,
    apiPassword: null,
    submissionEmail: "inbox@example.com"
  },
  operationalLimits: {
    maxLendingLimit: null,
    maxLtv: null,
    maxLoanTerm: null,
    maxAmortization: null
  }
};

const inactiveLender: Lender = {
  ...activeLender,
  id: "l-inactive",
  name: "Inactive Lender",
  active: false,
  status: "INACTIVE"
};

describe("LenderProductsPage", () => {
  it("shows only active lenders in the product form dropdown", async () => {
    const fetchLendersMock = vi.mocked(fetchLenders);
    fetchLendersMock.mockResolvedValue([activeLender, inactiveLender]);
    vi.mocked(fetchLenderProducts).mockResolvedValue([]);

    renderWithProviders(
      <MemoryRouter initialEntries={["/lender-products"]}>
        <Routes>
          <Route path="/lender-products" element={<LenderProductsPage />} />
        </Routes>
      </MemoryRouter>
    );

    const select = await screen.findByLabelText(/Active lender/i);
    const options = within(select).getAllByRole("option");
    expect(options.map((option) => option.textContent)).toContain("Active Lender");
    expect(options.map((option) => option.textContent)).not.toContain("Inactive Lender");
  });

  it("warns when no active lenders are available", async () => {
    const fetchLendersMock = vi.mocked(fetchLenders);
    fetchLendersMock.mockResolvedValue([inactiveLender]);
    vi.mocked(fetchLenderProducts).mockResolvedValue([]);

    renderWithProviders(
      <MemoryRouter initialEntries={["/lender-products"]}>
        <Routes>
          <Route path="/lender-products" element={<LenderProductsPage />} />
        </Routes>
      </MemoryRouter>
    );

    expect(await screen.findByText(/No active lenders available/i)).toBeInTheDocument();
  });
});
