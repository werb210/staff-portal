// @vitest-environment jsdom
import "@testing-library/jest-dom/vitest";
import { screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import BankingTab from "@/pages/applications/drawer/tab-banking/BankingTab";
import { renderWithProviders } from "@/test/testUtils";
import { useApplicationDrawerStore } from "@/state/applicationDrawer.store";
import { fetchBankingAnalysis } from "@/api/banking";
import { useApplicationDetails } from "@/pages/applications/hooks/useApplicationDetails";

vi.mock("@/api/banking", () => ({
  fetchBankingAnalysis: vi.fn()
}));
vi.mock("@/pages/applications/hooks/useApplicationDetails", () => ({
  useApplicationDetails: vi.fn()
}));

describe("BankingTab", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useApplicationDetails).mockReturnValue({
      applicationId: null,
      data: undefined
    } as unknown as ReturnType<typeof useApplicationDetails>);
  });

  it("renders only when the banking tab is available", () => {
    useApplicationDrawerStore.setState({ isOpen: true, selectedApplicationId: null, selectedTab: "banking" });

    renderWithProviders(<BankingTab />);

    expect(screen.getByText("Select an application to view banking analysis.")).toBeInTheDocument();
    expect(screen.queryByText("Coverage Summary")).not.toBeInTheDocument();
  });

  it("shows a pending banner when banking analysis is in progress", async () => {
    useApplicationDrawerStore.setState({ isOpen: true, selectedApplicationId: "app-123", selectedTab: "banking" });
    vi.mocked(useApplicationDetails).mockReturnValue({
      applicationId: "app-123",
      data: { banking_completed_at: null, bank_statement_count: 4 }
    } as unknown as ReturnType<typeof useApplicationDetails>);
    vi.mocked(fetchBankingAnalysis).mockResolvedValue({
      monthsDetected: "6 of 6 months received",
      monthGroups: [{ year: "2025", months: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"] }]
    });

    renderWithProviders(<BankingTab />);

    expect(await screen.findByText("Waiting for statements")).toBeInTheDocument();
  });

  it("shows processing when statements are present but banking is incomplete", async () => {
    useApplicationDrawerStore.setState({ isOpen: true, selectedApplicationId: "app-124", selectedTab: "banking" });
    vi.mocked(useApplicationDetails).mockReturnValue({
      applicationId: "app-124",
      data: { banking_completed_at: null, bank_statement_count: 6 }
    } as unknown as ReturnType<typeof useApplicationDetails>);
    vi.mocked(fetchBankingAnalysis).mockResolvedValue({
      monthsDetected: "6 of 6 months received",
      monthGroups: [{ year: "2025", months: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"] }]
    });

    renderWithProviders(<BankingTab />);

    expect(await screen.findByText("Processing…")).toBeInTheDocument();
  });

  it("shows completed when banking analysis is finished", async () => {
    useApplicationDrawerStore.setState({ isOpen: true, selectedApplicationId: "app-125", selectedTab: "banking" });
    vi.mocked(useApplicationDetails).mockReturnValue({
      applicationId: "app-125",
      data: { banking_completed_at: "2025-07-01T12:00:00Z", bank_statement_count: 6 }
    } as unknown as ReturnType<typeof useApplicationDetails>);
    vi.mocked(fetchBankingAnalysis).mockResolvedValue({
      monthsDetected: "6 of 6 months received",
      monthGroups: [{ year: "2025", months: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"] }]
    });

    renderWithProviders(<BankingTab />);

    expect(await screen.findByText("Completed")).toBeInTheDocument();
  });

  it("renders all sections with server data and no editable controls", async () => {
    useApplicationDrawerStore.setState({ isOpen: true, selectedApplicationId: "app-456", selectedTab: "banking" });
    vi.mocked(useApplicationDetails).mockReturnValue({
      applicationId: "app-456",
      data: { banking_completed_at: "2025-07-01T12:00:00Z", bank_statement_count: 6 }
    } as unknown as ReturnType<typeof useApplicationDetails>);
    vi.mocked(fetchBankingAnalysis).mockResolvedValue({
      bankingCompletedAt: "2025-07-01T12:00:00Z",
      monthsDetected: "6 of 6 months received",
      monthGroups: [{ year: "2025", months: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"] }],
      dateRange: "Jan 1, 2025 – Jun 30, 2025",
      bankCount: 2,
      inflows: {
        totalDeposits: "$100",
        averageMonthlyDeposits: "$999",
        topDepositSources: [{ name: "Stripe", percentage: "55%" }]
      },
      outflows: {
        totalWithdrawals: "$25",
        averageMonthlyWithdrawals: "$7",
        topExpenseCategories: [{ name: "Payroll", percentage: "60%" }]
      },
      cashFlow: {
        netCashFlowMonthlyAverage: "$15",
        volatility: "Medium"
      },
      balances: {
        averageDailyBalance: "$200",
        lowestBalance: "$25",
        nsfOverdraftCount: 1
      },
      riskFlags: {
        irregularDeposits: "None",
        revenueConcentration: "High",
        decliningBalances: "No",
        nsfOverdraftEvents: "1 event"
      }
    });

    const { container } = renderWithProviders(<BankingTab />);

    expect(await screen.findByText("Coverage Summary")).toBeInTheDocument();
    expect(screen.getByText("Inflows")).toBeInTheDocument();
    expect(screen.getByText("Outflows")).toBeInTheDocument();
    expect(screen.getByText("Cash Flow")).toBeInTheDocument();
    expect(screen.getByText("Balances")).toBeInTheDocument();
    expect(screen.getByText("Risk Flags")).toBeInTheDocument();
    expect(screen.getByText("6 of 6 months received")).toBeInTheDocument();
    expect(screen.getByText("Jan 1, 2025 – Jun 30, 2025")).toBeInTheDocument();
    expect(screen.getByText("$999")).toBeInTheDocument();
    expect(screen.getAllByText("$25").length).toBeGreaterThan(0);
    expect(screen.getByText("Stripe")).toBeInTheDocument();
    expect(screen.getByText("Payroll")).toBeInTheDocument();
    expect(screen.getByText("Medium")).toBeInTheDocument();
    expect(screen.getByText("1 event")).toBeInTheDocument();

    expect(container.querySelectorAll("input, select, textarea, button").length).toBe(0);
  });
});
