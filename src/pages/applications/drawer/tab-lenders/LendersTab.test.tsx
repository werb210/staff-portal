// @vitest-environment jsdom
import "@testing-library/jest-dom/vitest";
import { screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import LendersTab from "@/pages/applications/drawer/tab-lenders/LendersTab";
import { renderWithProviders } from "@/test/testUtils";
import { useApplicationDrawerStore } from "@/state/applicationDrawer.store";
import {
  fetchLenderMatches,
  fetchLenderSubmissions,
  retryLenderSubmission
} from "@/api/lenders";

vi.mock("@/api/lenders", () => ({
  fetchLenderMatches: vi.fn(),
  fetchLenderSubmissions: vi.fn(),
  createLenderSubmission: vi.fn(),
  retryLenderTransmission: vi.fn(),
  retryLenderSubmission: vi.fn()
}));

describe("LendersTab", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useApplicationDrawerStore.setState({ isOpen: true, selectedApplicationId: "app-123", selectedTab: "lenders" });
  });

  it("renders submission status details on the application card", async () => {
    vi.mocked(fetchLenderMatches).mockResolvedValue([
      { id: "prod-1", lenderName: "Merchant Growth", productCategory: "Term Loan" }
    ]);
    vi.mocked(fetchLenderSubmissions).mockResolvedValue([
      {
        id: "sub-1",
        lenderProductId: "prod-1",
        status: "sent",
        updatedAt: "2024-01-01T12:00:00Z",
        method: "EMAIL",
        transmissionId: "ext-456"
      }
    ]);

    renderWithProviders(<LendersTab />);

    expect(await screen.findByText("Submissions")).toBeInTheDocument();
    expect((await screen.findAllByText("Merchant Growth")).length).toBeGreaterThan(0);
    expect(screen.getByText("Submitted", { selector: "span" })).toBeInTheDocument();
    expect(screen.getByText("Email")).toBeInTheDocument();
    expect(screen.getByText("ext-456")).toBeInTheDocument();
  });

  it("shows retry submission only for staff/admin roles", async () => {
    vi.mocked(fetchLenderMatches).mockResolvedValue([{ id: "prod-1", lenderName: "Atlas Bank" }]);
    vi.mocked(fetchLenderSubmissions).mockResolvedValue([
      {
        id: "sub-2",
        lenderProductId: "prod-1",
        status: "failed",
        errorMessage: "Permission denied",
        updatedAt: "2024-01-01T12:00:00Z",
        method: "API"
      }
    ]);

    const { unmount } = renderWithProviders(<LendersTab />, {
      auth: { user: { id: "1", email: "admin@example.com", role: "Admin" } }
    });
    expect(await screen.findByRole("button", { name: /Retry submission/i })).toBeInTheDocument();

    unmount();
    useApplicationDrawerStore.setState({ isOpen: true, selectedApplicationId: "app-123", selectedTab: "lenders" });
    renderWithProviders(<LendersTab />, { auth: { user: { id: "2", email: "lender@example.com", role: "Lender" } } });
    expect(screen.queryByRole("button", { name: /Retry submission/i })).not.toBeInTheDocument();
    expect(await screen.findByText(/do not have permission/i)).toBeInTheDocument();
  });
});
