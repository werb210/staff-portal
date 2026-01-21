// @vitest-environment jsdom
import "@testing-library/jest-dom/vitest";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { AuthProvider } from "@/auth/AuthContext";
import { fetchCurrentUser } from "@/api/auth";
import LendersPage from "@/pages/lenders/LendersPage";
import LenderProductsPage from "@/pages/lenders/LenderProductsPage";
import LoginPage from "@/pages/login/LoginPage";
import {
  LENDER_PRODUCT_CATEGORIES,
  LENDER_PRODUCT_CATEGORY_LABELS,
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
import { clearStoredAuth, setStoredAccessToken } from "@/services/token";

vi.mock("@/api/lenders", () => ({
  fetchLenders: vi.fn(),
  createLender: vi.fn(),
  updateLender: vi.fn(),
  fetchLenderProducts: vi.fn(),
  createLenderProduct: vi.fn(),
  updateLenderProduct: vi.fn()
}));

vi.mock("@/api/auth", () => ({
  fetchCurrentUser: vi.fn()
}));

const mockedFetchCurrentUser = vi.mocked(fetchCurrentUser);

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
  maxAmount: 500000,
  minTermMonths: 6,
  maxTermMonths: 60,
  minLtv: 30,
  maxLtv: 80,
  minLtc: 50,
  maxLtc: 85,
  minCreditScore: 650,
  maxInterestRate: 10.25,
  minInterestRate: 6.5,
  originationFee: 2,
  guarantyFee: 1,
  prepaymentPenalty: "None",
  eligiblePropertyTypes: ["Retail", "Industrial"],
  allowPrimaryResidence: false,
  allowOwnerOccupied: true,
  allowNonOwnerOccupied: true,
  allowForeignNationals: false,
  allowFirstTimeInvestors: true
};

describe("lender management flows", () => {
  beforeEach(() => {
    clearStoredAuth();
    setStoredAccessToken("test-token");
    mockedFetchCurrentUser.mockResolvedValue({ data: { id: "u1", role: "Admin" } } as any);
  });

  afterEach(() => {
    clearStoredAuth();
    vi.clearAllMocks();
  });

  it("renders lender list", async () => {
    const fetchLendersMock = vi.mocked(fetchLenders);
    fetchLendersMock.mockResolvedValueOnce([baseLender]);

    renderWithProviders("/lenders");

    await waitFor(() => {
      expect(screen.getByText(/Northwind Capital/)).toBeInTheDocument();
    });
  });

  it("creates a new lender", async () => {
    const fetchLendersMock = vi.mocked(fetchLenders);
    fetchLendersMock.mockResolvedValueOnce([]);
    const createLenderMock = vi.mocked(createLender);
    createLenderMock.mockResolvedValueOnce(baseLender);

    renderWithProviders("/lenders/new");

    const nameInput = await screen.findByLabelText(/^Name$/i);
    await userEvent.type(nameInput, "Northwind Capital");
    await userEvent.type(screen.getByLabelText(/Street/i), "1 Main St");
    await userEvent.type(screen.getByLabelText(/City/i), "Toronto");
    await userEvent.selectOptions(screen.getByLabelText("State / Province"), "ON");
    await userEvent.type(screen.getByLabelText(/Postal code/i), "M5J 2N1");
    await userEvent.type(screen.getByLabelText(/^Phone$/i), "+1 555 111 2222");
    await userEvent.type(screen.getByLabelText(/Contact name/i), "Primary Contact");
    await userEvent.type(screen.getByLabelText(/Contact email/i), "primary@example.com");

    fireEvent.click(screen.getByRole("button", { name: /Create lender/i }));

    await waitFor(() => {
      expect(createLenderMock).toHaveBeenCalled();
    });
  });

  it("updates lender info", async () => {
    const fetchLendersMock = vi.mocked(fetchLenders);
    fetchLendersMock.mockResolvedValueOnce([baseLender]);
    const updateLenderMock = vi.mocked(updateLender);
    updateLenderMock.mockResolvedValueOnce(baseLender);

    renderWithProviders("/lenders/l-1/edit");

    const nameInput = await screen.findByLabelText(/^Name$/i);
    await userEvent.clear(nameInput);
    await userEvent.type(nameInput, "Northwind Updated");
    fireEvent.click(screen.getByRole("button", { name: /Save changes/i }));

    await waitFor(() => {
      expect(updateLenderMock).toHaveBeenCalled();
    });
  });

  it("renders lender products", async () => {
    const fetchLendersMock = vi.mocked(fetchLenders);
    fetchLendersMock.mockResolvedValue([baseLender]);
    const fetchLenderProductsMock = vi.mocked(fetchLenderProducts);
    fetchLenderProductsMock.mockResolvedValue([baseProduct]);

    renderWithProviders("/lender-products");

    expect(await screen.findByText(/Term loan/i)).toBeInTheDocument();
  });

  it("creates a lender product", async () => {
    const fetchLendersMock = vi.mocked(fetchLenders);
    fetchLendersMock.mockResolvedValue([baseLender]);
    const fetchLenderProductsMock = vi.mocked(fetchLenderProducts);
    fetchLenderProductsMock.mockResolvedValue([]);
    const createLenderProductMock = vi.mocked(createLenderProduct);
    createLenderProductMock.mockResolvedValueOnce(baseProduct);

    renderWithProviders("/lender-products/new");

    await screen.findByRole("option", { name: baseLender.name });
    await userEvent.selectOptions(await screen.findByLabelText(/Lender/i), baseLender.id);
    await userEvent.type(await screen.findByLabelText(/Product name/i), "Term loan");
    await userEvent.type(await screen.findByLabelText(/Country/i), "CA");
    await userEvent.type(await screen.findByLabelText(/Currency/i), "CAD");
    await userEvent.type(await screen.findByLabelText(/Minimum amount/i), "1000");
    await userEvent.type(await screen.findByLabelText(/Maximum amount/i), "5000");
    await userEvent.type(await screen.findByLabelText(/Interest rate min/i), "5");
    await userEvent.type(await screen.findByLabelText(/Interest rate max/i), "10");
    await userEvent.type(await screen.findByLabelText(/Term length min/i), "6");
    await userEvent.type(await screen.findByLabelText(/Term length max/i), "12");
    await userEvent.click(await screen.findByLabelText(/Required document 1/i));

    fireEvent.click(screen.getByRole("button", { name: /Create product/i }));

    await waitFor(() => {
      expect(createLenderProductMock).toHaveBeenCalled();
    });
  });

  it("renders lender product categories", async () => {
    const fetchLendersMock = vi.mocked(fetchLenders);
    fetchLendersMock.mockResolvedValueOnce([baseLender]);
    renderWithProviders("/lender-products/new");

    const categorySelect = await screen.findByLabelText(/Product category/i);

    LENDER_PRODUCT_CATEGORIES.forEach((category) => {
      expect(categorySelect).toHaveTextContent(LENDER_PRODUCT_CATEGORY_LABELS[category]);
    });
  });

  it("validates product categories", () => {
    expect(isLenderProductCategory("TERM_LOAN")).toBe(true);
    expect(isLenderProductCategory("UNKNOWN")).toBe(false);
  });

  it("displays product form sections", async () => {
    renderWithProviders("/lender-products/new");

    await waitFor(() => {
      expect(screen.getByText(/Core details/i)).toBeInTheDocument();
      expect(screen.getByText(/Amount & pricing/i)).toBeInTheDocument();
      expect(screen.getByText(/Eligibility requirements/i)).toBeInTheDocument();
      expect(screen.getByText(/Required documents/i)).toBeInTheDocument();
    });
  });

  it("expands accordion sections", async () => {
    renderWithProviders("/lender-products/new");

    expect(await screen.findByLabelText(/Required document 1/i)).toBeInTheDocument();
  });
});
