// @vitest-environment jsdom
import "@testing-library/jest-dom/vitest";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { AuthProvider } from "@/auth/AuthContext";
import { setStoredAccessToken } from "@/services/token";
import LendersPage from "@/pages/lenders/LendersPage";
import LenderProductsPage from "@/pages/lenders/LenderProductsPage";
import LoginPage from "@/pages/login/LoginPage";
import {
  DOCUMENT_TYPES,
  DOCUMENT_TYPE_LABELS,
  LENDER_PRODUCT_CATEGORIES,
  isLenderProductCategory
} from "@/types/lenderManagement.types";
import type { Lender, LenderProduct } from "@/types/lenderManagement.models";
import {
  createLender,
  createLenderProduct,
  fetchLenderProducts,
  fetchLenders,
  updateLender
} from "@/api/lenders";

vi.mock("@/api/lenders", () => ({
  fetchLenders: vi.fn(),
  createLender: vi.fn(),
  updateLender: vi.fn(),
  fetchLenderProducts: vi.fn(),
  createLenderProduct: vi.fn(),
  updateLenderProduct: vi.fn()
}));

const makeJwt = (payload: Record<string, unknown>) => {
  const encoded = btoa(JSON.stringify(payload))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
  return `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.${encoded}.signature`;
};

const renderWithProviders = (initialEntry: string) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false }
    }
  });

  return render(
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <MemoryRouter initialEntries={[initialEntry]}>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/lenders" element={<LendersPage />} />
            <Route path="/lenders/new" element={<LendersPage />} />
            <Route path="/lenders/:lenderId/edit" element={<LendersPage />} />
            <Route path="/lender-products" element={<LenderProductsPage />} />
            <Route path="/lender-products/new" element={<LenderProductsPage />} />
            <Route path="/lender-products/:productId/edit" element={<LenderProductsPage />} />
          </Routes>
        </MemoryRouter>
      </AuthProvider>
    </QueryClientProvider>
  );
};

const baseLender: Lender = {
  id: "l-1",
  name: "Northwind Capital",
  active: true,
  address: {
    street: "1 Main St",
    city: "Austin",
    stateProvince: "TX",
    postalCode: "78701",
    country: "US"
  },
  phone: "+1 555 111 2222",
  website: null,
  description: null,
  internalNotes: null,
  processingNotes: null,
  primaryContact: {
    name: "Alex Agent",
    email: "alex@example.com",
    phone: "+1 555 111 3333",
    mobilePhone: "+1 555 111 4444"
  },
  submissionConfig: {
    method: "API",
    apiBaseUrl: "https://api.example.com",
    apiClientId: "client-id",
    apiUsername: "api-user",
    apiPassword: "super-secret",
    submissionEmail: null
  },
  operationalLimits: {
    maxLendingLimit: null,
    maxLtv: null,
    maxLoanTerm: null,
    maxAmortization: null
  }
};

const baseProduct: LenderProduct = {
  id: "p-1",
  lenderId: "l-1",
  productName: "Term loan",
  active: true,
  category: "TERM_LOAN",
  country: "US",
  currency: "USD",
  minAmount: 10000,
  maxAmount: 50000,
  interestRateMin: 3,
  interestRateMax: 9,
  rateType: "fixed",
  termLength: { min: 6, max: 24, unit: "months" },
  minimumCreditScore: null,
  ltv: null,
  eligibilityRules: null,
  eligibilityFlags: {
    minimumRevenue: null,
    timeInBusinessMonths: null,
    industryRestrictions: null
  },
  requiredDocuments: ["business_bank_statements"]
};

beforeEach(() => {
  localStorage.clear();
  vi.clearAllMocks();
  setStoredAccessToken(makeJwt({ sub: "1", email: "staff@example.com", role: "Admin" }));
});

afterEach(() => {
  localStorage.clear();
});

describe("lender management", () => {
  it("creates a lender", async () => {
    const user = userEvent.setup();
    vi.mocked(fetchLenders).mockResolvedValue([]);
    vi.mocked(createLender).mockResolvedValue(baseLender);

    renderWithProviders("/lenders/new");

    await user.type(screen.getByLabelText(/^Name$/i), "Northwind Capital");
    await user.type(screen.getByLabelText(/Street/i), "1 Main St");
    await user.type(screen.getByLabelText(/City/i), "Austin");
    await user.type(screen.getByLabelText(/Postal code/i), "78701");
    await user.selectOptions(screen.getByLabelText(/^Country$/i), "US");
    await user.selectOptions(screen.getByLabelText(/State \/ Province/i), "TX");
    await user.type(screen.getByLabelText(/^Phone$/i), "+1 555 111 2222");
    await user.type(screen.getByLabelText(/Contact name/i), "Alex Agent");
    await user.type(screen.getByLabelText(/Contact email/i), "alex@example.com");

    await user.click(screen.getByRole("button", { name: /Create lender/i }));

    await waitFor(() => expect(createLender).toHaveBeenCalled());
  });

  it("edits a lender and does not render API credentials", async () => {
    const user = userEvent.setup();
    vi.mocked(fetchLenders).mockResolvedValue([baseLender]);
    vi.mocked(updateLender).mockResolvedValue({ ...baseLender, name: "Updated name" });

    renderWithProviders("/lenders/l-1/edit");

    expect(await screen.findByDisplayValue(baseLender.name)).toBeInTheDocument();
    expect(screen.queryByLabelText(/API client ID/i)).not.toBeInTheDocument();
    expect(screen.queryByLabelText(/API username/i)).not.toBeInTheDocument();
    expect(screen.queryByLabelText(/API password/i)).not.toBeInTheDocument();

    await user.clear(screen.getByLabelText(/^Name$/i));
    await user.type(screen.getByLabelText(/^Name$/i), "Updated name");
    await user.click(screen.getByRole("button", { name: /Save changes/i }));

    await waitFor(() =>
      expect(updateLender).toHaveBeenCalledWith(
        "l-1",
        expect.objectContaining({ name: "Updated name" })
      )
    );
  });

  it("deactivates a lender", async () => {
    vi.mocked(fetchLenders).mockResolvedValue([baseLender]);
    vi.mocked(updateLender).mockResolvedValue({ ...baseLender, active: false });

    renderWithProviders("/lenders");

    const deactivateButton = await screen.findByRole("button", { name: /Deactivate/i });
    fireEvent.click(deactivateButton);

    await waitFor(() => expect(updateLender).toHaveBeenCalledWith("l-1", { active: false }));
  });
});

describe("lender product management", () => {
  it("creates a lender product with a valid category", async () => {
    const user = userEvent.setup();
    vi.mocked(fetchLenders).mockResolvedValue([baseLender]);
    vi.mocked(fetchLenderProducts).mockResolvedValue([]);
    vi.mocked(createLenderProduct).mockResolvedValue({ ...baseProduct, id: "p-2" });

    renderWithProviders("/lender-products/new?lenderId=l-1");

    await user.type(screen.getByLabelText(/Product name/i), "Term loan");
    await user.type(screen.getByLabelText(/^Country$/i, { selector: "input" }), "US");
    await user.type(screen.getByLabelText(/Currency/i), "USD");
    await user.type(screen.getByLabelText(/Minimum amount/i), "10000");
    await user.type(screen.getByLabelText(/Maximum amount/i), "50000");
    await user.type(screen.getByLabelText(/Interest rate min/i), "5");
    await user.type(screen.getByLabelText(/Interest rate max/i), "10");
    await user.type(screen.getByLabelText(/Term length min/i), "6");
    await user.type(screen.getByLabelText(/Term length max/i), "24");

    await user.click(screen.getByLabelText(DOCUMENT_TYPE_LABELS[DOCUMENT_TYPES[0]]));

    await user.click(screen.getByRole("button", { name: /Create product/i }));

    await waitFor(() =>
      expect(createLenderProduct).toHaveBeenCalledWith(
        expect.objectContaining({
          lenderId: "l-1",
          category: "TERM_LOAN",
          requiredDocuments: [DOCUMENT_TYPES[0]]
        })
      )
    );
  });

  it("rejects SBA_GOVERNMENT unless the country is US", async () => {
    const user = userEvent.setup();
    vi.mocked(fetchLenders).mockResolvedValue([baseLender]);
    vi.mocked(fetchLenderProducts).mockResolvedValue([]);

    renderWithProviders("/lender-products/new?lenderId=l-1");

    await user.type(screen.getByLabelText(/Product name/i), "SBA Loan");
    await user.type(screen.getByLabelText(/^Country$/i, { selector: "input" }), "CA");
    await user.type(screen.getByLabelText(/Currency/i), "CAD");
    await user.type(screen.getByLabelText(/Minimum amount/i), "10000");
    await user.type(screen.getByLabelText(/Maximum amount/i), "50000");
    await user.type(screen.getByLabelText(/Interest rate min/i), "5");
    await user.type(screen.getByLabelText(/Interest rate max/i), "10");
    await user.type(screen.getByLabelText(/Term length min/i), "6");
    await user.type(screen.getByLabelText(/Term length max/i), "24");

    fireEvent.change(screen.getByLabelText(/Product category/i), { target: { value: "SBA_GOVERNMENT" } });
    await user.click(screen.getByLabelText(DOCUMENT_TYPE_LABELS[DOCUMENT_TYPES[0]]));
    await user.click(screen.getByRole("button", { name: /Create product/i }));

    expect(await screen.findByText(/SBA products must be limited to US lenders/i)).toBeInTheDocument();
    expect(createLenderProduct).not.toHaveBeenCalled();
  });

  it("rejects STARTUP_CAPITAL unless the country is CA and keeps it inactive", async () => {
    const user = userEvent.setup();
    vi.mocked(fetchLenders).mockResolvedValue([baseLender]);
    vi.mocked(fetchLenderProducts).mockResolvedValue([]);

    renderWithProviders("/lender-products/new?lenderId=l-1");

    await user.type(screen.getByLabelText(/Product name/i), "Startup capital");
    await user.type(screen.getByLabelText(/^Country$/i, { selector: "input" }), "US");
    await user.type(screen.getByLabelText(/Currency/i), "USD");
    await user.type(screen.getByLabelText(/Minimum amount/i), "10000");
    await user.type(screen.getByLabelText(/Maximum amount/i), "50000");
    await user.type(screen.getByLabelText(/Interest rate min/i), "5");
    await user.type(screen.getByLabelText(/Interest rate max/i), "10");
    await user.type(screen.getByLabelText(/Term length min/i), "6");
    await user.type(screen.getByLabelText(/Term length max/i), "24");

    fireEvent.change(screen.getByLabelText(/Product category/i), { target: { value: "STARTUP_CAPITAL" } });
    await user.click(screen.getByLabelText(DOCUMENT_TYPE_LABELS[DOCUMENT_TYPES[0]]));
    await user.click(screen.getByRole("button", { name: /Create product/i }));

    expect(await screen.findByText(/Startup capital is limited to Canada/i)).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText(/^Country$/i, { selector: "input" }), { target: { value: "CA" } });

    const activeToggle = screen.getByLabelText(/Active product/i);
    expect(activeToggle).toBeDisabled();
    expect(activeToggle).not.toBeChecked();
  });

  it("re-renders required documents for existing products", async () => {
    vi.mocked(fetchLenders).mockResolvedValue([baseLender]);
    vi.mocked(fetchLenderProducts).mockResolvedValue([
      {
        ...baseProduct,
        id: "p-3",
        requiredDocuments: [DOCUMENT_TYPES[0], DOCUMENT_TYPES[1]]
      }
    ]);

    renderWithProviders("/lender-products/p-3/edit?lenderId=l-1");

    const firstDoc = await screen.findByLabelText(DOCUMENT_TYPE_LABELS[DOCUMENT_TYPES[0]]);
    const secondDoc = screen.getByLabelText(DOCUMENT_TYPE_LABELS[DOCUMENT_TYPES[1]]);

    await waitFor(() => expect(firstDoc).toBeChecked());
    await waitFor(() => expect(secondDoc).toBeChecked());
  });

  it("matches the category enum in the dropdown", async () => {
    vi.mocked(fetchLenders).mockResolvedValue([baseLender]);
    vi.mocked(fetchLenderProducts).mockResolvedValue([]);

    renderWithProviders("/lender-products/new?lenderId=l-1");

    const select = await screen.findByLabelText(/Product category/i);
    const optionValues = within(select)
      .getAllByRole("option")
      .map((option) => option.getAttribute("value"));

    expect(optionValues).toEqual(LENDER_PRODUCT_CATEGORIES);
  });

  it("rejects invalid category values", () => {
    expect(isLenderProductCategory("TERM_LOAN")).toBe(true);
    expect(isLenderProductCategory("INVALID_CATEGORY")).toBe(false);
  });
});
