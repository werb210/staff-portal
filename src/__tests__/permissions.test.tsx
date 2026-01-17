// @vitest-environment jsdom
import { describe, expect, it, vi } from "vitest";
import { screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { renderWithProviders } from "@/test/testUtils";
import LendersPage from "@/pages/lenders/LendersPage";
import MarketingPage from "@/pages/marketing/MarketingPage";
import { fetchLenders } from "@/api/lenders";

vi.mock("@/api/lenders", () => ({
  fetchLenders: vi.fn().mockResolvedValue([])
}));

describe("permission-aware rendering", () => {
  it("shows a block message for unauthorized roles", () => {
    renderWithProviders(<MarketingPage />, {
      auth: {
        user: { id: "u-1", name: "Staff User", email: "staff@example.com", role: "Staff" },
        token: "token",
        status: "authenticated",
        authenticated: true,
        authReady: true
      }
    });

    expect(screen.getByText("Access restricted")).toBeInTheDocument();
    expect(screen.getByText("This space is limited to Admins.")).toBeInTheDocument();
  });

  it("does not fire API calls when the role is insufficient", () => {
    const fetchLendersMock = vi.mocked(fetchLenders);
    renderWithProviders(
      <MemoryRouter initialEntries={["/lenders"]}>
        <Routes>
          <Route path="/lenders/*" element={<LendersPage />} />
        </Routes>
      </MemoryRouter>,
      {
        auth: {
          user: { id: "u-2", name: "Lender User", email: "lender@example.com", role: "Lender" },
          token: "token",
          status: "authenticated",
          authenticated: true,
          authReady: true
        }
      }
    );

    expect(screen.getByText("Access restricted")).toBeInTheDocument();
    expect(fetchLendersMock).not.toHaveBeenCalled();
  });
});
