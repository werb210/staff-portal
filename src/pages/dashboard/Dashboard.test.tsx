import { screen } from "@testing-library/react";
import { renderWithProviders } from "@/test/testUtils";
import Dashboard from "@/pages/dashboard/Dashboard";

vi.mock("@/api/dashboard", () => ({
  dashboardApi: {
    getPipeline: vi.fn().mockResolvedValue({}),
    getActions: vi.fn().mockResolvedValue({}),
    getDocumentHealth: vi.fn().mockResolvedValue({}),
    getLenderActivity: vi.fn().mockResolvedValue({}),
    getOffers: vi.fn().mockResolvedValue({}),
    getMetrics: vi.fn().mockResolvedValue({})
  }
}));

describe("Dashboard", () => {
  it("renders dashboard panels", async () => {
    renderWithProviders(<Dashboard />);
    expect(await screen.findByText(/Pipeline Overview/i)).toBeInTheDocument();
    expect(screen.getByText(/Urgent Actions/i)).toBeInTheDocument();
    expect(screen.getByText(/Document Health/i)).toBeInTheDocument();
    expect(screen.getByText(/Lender Submissions/i)).toBeInTheDocument();
    expect(screen.getByText(/Offer Activity/i)).toBeInTheDocument();
    expect(screen.getByText(/Deal Metrics/i)).toBeInTheDocument();
  });
});
