// @vitest-environment jsdom
import "@testing-library/jest-dom/vitest";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";
import LendersPage from "@/pages/lenders/LendersPage";
import { renderWithProviders } from "@/test/testUtils";
import { fetchLenderProducts, fetchLenders } from "@/api/lenders";

vi.mock("@/api/lenders", () => ({
  fetchLenders: vi.fn(),
  fetchLenderById: vi.fn(),
  fetchLenderProducts: vi.fn(),
  createLender: vi.fn(),
  updateLender: vi.fn(),
  createLenderProduct: vi.fn(),
  updateLenderProduct: vi.fn()
}));

describe("lenders form", () => {
  it("shows Google Sheet fields only when the method is selected", async () => {
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

    expect(screen.queryByLabelText(/Google Sheet ID/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/Column mapping editor/i)).not.toBeInTheDocument();

    await userEvent.selectOptions(screen.getByLabelText(/Submission method/i), "GOOGLE_SHEET");

    expect(screen.getByLabelText(/Google Sheet ID/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Sheet tab name/i)).toBeInTheDocument();
    expect(screen.getByText(/Column mapping editor/i)).toBeInTheDocument();
  });
});
