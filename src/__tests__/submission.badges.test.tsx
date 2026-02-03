// @vitest-environment jsdom
import "@testing-library/jest-dom/vitest";
import { screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import LendersTab from "@/pages/applications/drawer/tab-lenders/LendersTab";
import LenderProductDetail from "@/pages/lenders/LenderProductDetail";
import { renderWithProviders } from "@/test/testUtils";
import { useApplicationDrawerStore } from "@/state/applicationDrawer.store";
import {
  fetchClientLenderProductRequirements,
  fetchLenderMatches,
  fetchLenderProductById,
  fetchLenderSubmissions,
  fetchLenders
} from "@/api/lenders";

vi.mock("@/api/lenders", () => ({
  fetchLenderMatches: vi.fn(),
  fetchLenderSubmissions: vi.fn(),
  fetchLenderProductById: vi.fn(),
  fetchLenders: vi.fn(),
  fetchClientLenderProductRequirements: vi.fn(),
  createLenderSubmission: vi.fn(),
  retryLenderTransmission: vi.fn(),
  retryLenderSubmission: vi.fn()
}));

describe("submission badges", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useApplicationDrawerStore.setState({ isOpen: true, selectedApplicationId: "app-123", selectedTab: "lenders" });
  });

  it("renders a Google Sheet submission badge in the application drawer", async () => {
    vi.mocked(fetchLenderMatches).mockResolvedValue([{ id: "prod-1", lenderName: "Atlas Bank" }]);
    vi.mocked(fetchLenderSubmissions).mockResolvedValue([
      {
        id: "sub-1",
        lenderProductId: "prod-1",
        status: "sent",
        updatedAt: "2024-01-01T12:00:00Z",
        method: "GOOGLE_SHEET",
        externalReference: "Sheet Row #184"
      }
    ]);

    renderWithProviders(<LendersTab />);

    const badge = await screen.findByText("Google Sheet");
    expect(badge.closest("span")).toHaveClass("status-pill--submission-google-sheet");
  });

  it("shows a submission config summary without exposing sheet IDs", async () => {
    vi.mocked(fetchLenderProductById).mockResolvedValue({
      id: "product-1",
      lenderId: "lender-1",
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
    });
    vi.mocked(fetchLenders).mockResolvedValue([
      {
        id: "lender-1",
        name: "Atlas Bank",
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
        internalNotes: null,
        processingNotes: null,
        primaryContact: { name: "", email: "", phone: "", mobilePhone: "" },
        submissionConfig: {
          method: "GOOGLE_SHEET",
          sheetId: "sheet-secret",
          worksheetName: "Weekly Intake",
          mappingPreview: null,
          sheetStatus: "Atlas Spreadsheet",
          attachmentFormat: null,
          apiAuthType: null,
          apiBaseUrl: null,
          apiClientId: null,
          apiUsername: null,
          apiPassword: null,
          submissionEmail: null
        },
        operationalLimits: {
          maxLendingLimit: null,
          maxLtv: null,
          maxLoanTerm: null,
          maxAmortization: null
        }
      }
    ]);
    vi.mocked(fetchClientLenderProductRequirements).mockResolvedValue({ requirements: [], documentTypes: [] });

    renderWithProviders(
      <MemoryRouter initialEntries={["/lenders/products/product-1"]}>
        <Routes>
          <Route path="/lenders/products/:productId" element={<LenderProductDetail />} />
        </Routes>
      </MemoryRouter>
    );

    expect(await screen.findByText(/Spreadsheet: Atlas Spreadsheet • Sheet: Weekly Intake/i)).toBeInTheDocument();
    expect(screen.queryByText("sheet-secret")).not.toBeInTheDocument();
  });
});
