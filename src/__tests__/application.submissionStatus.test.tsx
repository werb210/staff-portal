// @vitest-environment jsdom
import "@testing-library/jest-dom/vitest";
import { screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import LendersTab from "@/pages/applications/drawer/tab-lenders/LendersTab";
import { renderWithProviders } from "@/test/testUtils";
import { useApplicationDrawerStore } from "@/state/applicationDrawer.store";
import { fetchLenderMatches, fetchLenderSubmissions } from "@/api/lenders";

vi.mock("@/api/lenders", () => ({
  fetchLenderMatches: vi.fn(),
  fetchLenderSubmissions: vi.fn(),
  createLenderSubmission: vi.fn(),
  retryLenderTransmission: vi.fn(),
  retryLenderSubmission: vi.fn()
}));

describe("application submission status", () => {
  beforeEach(() => {
    useApplicationDrawerStore.setState({ isOpen: true, selectedApplicationId: "app-77", selectedTab: "lenders" });
    vi.clearAllMocks();
  });

  it("renders status details and retry logic", async () => {
    vi.mocked(fetchLenderMatches).mockResolvedValue([
      { id: "prod-1", lenderName: "Atlas Sheet" },
      { id: "prod-2", lenderName: "Atlas Email" }
    ]);
    vi.mocked(fetchLenderSubmissions).mockResolvedValue([
      {
        id: "sub-1",
        lenderProductId: "prod-1",
        status: "failed",
        method: "GOOGLE_SHEET",
        updatedAt: "2024-04-01T10:00:00Z",
        errorMessage: "Sheet unreachable"
      },
      {
        id: "sub-2",
        lenderProductId: "prod-2",
        status: "sent",
        method: "EMAIL",
        updatedAt: "2024-04-01T11:00:00Z"
      }
    ]);

    renderWithProviders(<LendersTab />, {
      auth: { user: { id: "1", email: "staff@example.com", role: "Staff" } }
    });

    await waitFor(() => {
      expect(screen.getByText("Submissions")).toBeInTheDocument();
    });

    expect(screen.getByText("Google Sheet")).toBeInTheDocument();
    expect(screen.getAllByText("Submission failed — retry available").length).toBeGreaterThan(0);
    expect(screen.queryByText("Sheet unreachable")).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Retry submission/i })).toBeInTheDocument();
    expect(screen.queryAllByRole("button", { name: /Retry submission/i }).length).toBe(1);
  });
});
