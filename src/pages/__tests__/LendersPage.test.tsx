// @vitest-environment jsdom
import "@testing-library/jest-dom/vitest";
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import LendersPage from "@/pages/lenders/LendersPage";
import type { Lender, LenderProduct } from "@/types/lenderManagement.models";
import { renderWithProviders } from "@/test/testUtils";
import {
  createLender,
  createLenderProduct,
  fetchLenderById,
  fetchLenderProducts,
  fetchLenders
} from "@/api/lenders";

vi.mock("@/api/lenders", () => ({
  fetchLenders: vi.fn(),
  fetchLenderById: vi.fn(),
  fetchLenderProducts: vi.fn(),
  createLender: vi.fn(),
  updateLender: vi.fn(),
  createLenderProduct: vi.fn(),
  updateLenderProduct: vi.fn()
}));

const activeLender: Lender = {
  id: "l-1",
  name: "Northern Bank",
  active: true,
  status: "ACTIVE",
  address: {
    street: "",
    city: "",
    stateProvince: "",
    postalCode: "",
    country: "CA"
  },
  phone: "",
  website: null,
  description: null,
  internalNotes: "Internal notes",
  processingNotes: null,
  primaryContact: {
    name: "Alex Agent",
    email: "alex@example.com",
    phone: "555-1111",
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
    submissionEmail: "submit@example.com"
  },
  operationalLimits: {
    maxLendingLimit: null,
    maxLtv: null,
    maxLoanTerm: null,
    maxAmortization: null
  }
};

const lineOfCreditProduct: LenderProduct = {
  id: "p-1",
  lenderId: "l-1",
  productName: "Working Capital",
  active: true,
  category: "LINE_OF_CREDIT",
  country: "CA",
  currency: "CAD",
  minAmount: 10000,
  maxAmount: 50000,
  interestRateMin: 8,
  interestRateMax: 14,
  rateType: "fixed",
  termLength: { min: 6, max: 24, unit: "months" },
  fees: null,
  minimumCreditScore: null,
  ltv: null,
  eligibilityRules: null,
  eligibilityFlags: {
    minimumRevenue: null,
    timeInBusinessMonths: null,
    industryRestrictions: null
  },
  requiredDocuments: []
};

describe("LendersPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("creates an active lender and shows it as Active", async () => {
    vi.mocked(fetchLenders).mockResolvedValue([activeLender]);
    vi.mocked(fetchLenderProducts).mockResolvedValue([]);
    vi.mocked(createLender).mockResolvedValue(activeLender);

    renderWithProviders(
      <MemoryRouter initialEntries={["/lenders"]}>
        <Routes>
          <Route path="/lenders" element={<LendersPage />} />
        </Routes>
      </MemoryRouter>
    );

    await userEvent.click(await screen.findByRole("button", { name: /Create lender/i }));

    await userEvent.type(screen.getByLabelText(/Lender name/i), "Northern Bank");
    await userEvent.type(screen.getByLabelText(/Contact name/i), "Alex Agent");
    await userEvent.type(screen.getByLabelText(/Contact email/i), "alex@example.com");
    await userEvent.type(screen.getByLabelText(/Target email address/i), "submit@example.com");

    const createButtons = screen.getAllByRole("button", { name: /Create lender/i });
    await userEvent.click(createButtons[createButtons.length - 1]);

    await waitFor(() => expect(createLender).toHaveBeenCalled());
    expect(await screen.findByText("Active")).toBeInTheDocument();
    expect(screen.getByText("Northern Bank")).toBeInTheDocument();
  }, 10000);

  it("loads persisted lender fields in the edit modal", async () => {
    vi.mocked(fetchLenders).mockResolvedValue([activeLender]);
    vi.mocked(fetchLenderProducts).mockResolvedValue([]);
    vi.mocked(fetchLenderById).mockResolvedValue(activeLender);

    renderWithProviders(
      <MemoryRouter initialEntries={["/lenders"]}>
        <Routes>
          <Route path="/lenders" element={<LendersPage />} />
        </Routes>
      </MemoryRouter>
    );

    await userEvent.click(await screen.findByText("Northern Bank"));

    expect(await screen.findByLabelText(/Lender name/i)).toHaveValue("Northern Bank");
    expect(screen.getByLabelText(/Contact name/i)).toHaveValue("Alex Agent");
    expect(screen.getByLabelText(/Contact email/i)).toHaveValue("alex@example.com");
    expect(screen.getByLabelText(/Target email address/i)).toHaveValue("submit@example.com");
    expect(screen.getByLabelText(/Active lender/i)).toBeChecked();
  });

  it("creates a product for an active lender and groups products by category", async () => {
    vi.mocked(fetchLenders).mockResolvedValue([activeLender]);
    vi.mocked(fetchLenderProducts).mockResolvedValue([lineOfCreditProduct]);
    vi.mocked(createLenderProduct).mockResolvedValue(lineOfCreditProduct);

    renderWithProviders(
      <MemoryRouter initialEntries={["/lenders"]}>
        <Routes>
          <Route path="/lenders" element={<LendersPage />} />
        </Routes>
      </MemoryRouter>
    );

    await userEvent.click(await screen.findByRole("button", { name: /Add product/i }));

    await userEvent.type(screen.getByLabelText(/Product name/i), "Working Capital");
    await userEvent.click(screen.getByLabelText(/Canada/i));
    await userEvent.type(screen.getByLabelText(/Minimum amount/i), "10000");
    await userEvent.type(screen.getByLabelText(/Maximum amount/i), "50000");
    await userEvent.type(screen.getByLabelText(/Min term/i), "6");
    await userEvent.type(screen.getByLabelText(/Max term/i), "24");
    await userEvent.type(screen.getByLabelText(/Interest min/i), "8");
    await userEvent.type(screen.getByLabelText(/Interest max/i), "14");

    await userEvent.click(screen.getByRole("button", { name: /Save product/i }));

    await waitFor(() => expect(createLenderProduct).toHaveBeenCalled());

    expect(await screen.findByText("Line of Credit")).toBeInTheDocument();
    expect(screen.getByText("Working Capital")).toBeInTheDocument();
  }, 10000);

  it("renders submission configuration fields based on the selected method", async () => {
    vi.mocked(fetchLenders).mockResolvedValue([]);
    vi.mocked(fetchLenderProducts).mockResolvedValue([]);

    renderWithProviders(
      <MemoryRouter initialEntries={["/lenders"]}>
        <Routes>
          <Route path="/lenders" element={<LendersPage />} />
        </Routes>
      </MemoryRouter>
    );

    await userEvent.click(await screen.findByRole("button", { name: /Create lender/i }));

    const methodSelect = screen.getByLabelText(/Submission method/i);
    await userEvent.selectOptions(methodSelect, "GOOGLE_SHEET");
    expect(screen.getByLabelText(/Sheet ID/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Worksheet name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Mapping preview/i)).toBeInTheDocument();
    expect(screen.getAllByText(/Status/i).length).toBeGreaterThan(0);

    await userEvent.selectOptions(methodSelect, "EMAIL");
    expect(screen.getByLabelText(/Target email address/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Attachment format/i)).toBeInTheDocument();

    await userEvent.selectOptions(methodSelect, "API");
    expect(screen.getByLabelText(/Endpoint/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Auth type/i)).toBeInTheDocument();
  });
});
