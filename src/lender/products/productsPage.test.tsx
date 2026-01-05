import { screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import ProductsPage from "./ProductsPage";
import {
  createLenderProduct,
  deleteLenderProduct,
  fetchLenderProducts,
  updateLenderProduct,
  uploadLenderApplicationForm,
  updateRequiredDocuments
} from "@/api/lender/products";
import { fetchDocumentCategories } from "@/api/lender/documents";
import { actAsync } from "@/test/testUtils";
import { renderWithLenderProviders } from "@/test/renderHelpers";

vi.mock("@/api/lender/products", () => ({
  createLenderProduct: vi.fn(),
  deleteLenderProduct: vi.fn(),
  fetchLenderProducts: vi.fn(),
  updateLenderProduct: vi.fn(),
  uploadLenderApplicationForm: vi.fn(),
  updateRequiredDocuments: vi.fn()
}));

vi.mock("@/api/lender/documents", () => ({
  fetchDocumentCategories: vi.fn()
}));

describe("Products page", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("creates a product and updates required documents", async () => {
    (fetchLenderProducts as unknown as vi.Mock).mockResolvedValue([]);
    (fetchDocumentCategories as unknown as vi.Mock).mockResolvedValue(["Bank Statements", "Business License"]);
    (createLenderProduct as unknown as vi.Mock).mockResolvedValue({ id: "p1", productName: "New Product", active: true });
    (updateRequiredDocuments as unknown as vi.Mock).mockResolvedValue({});
    (uploadLenderApplicationForm as unknown as vi.Mock).mockResolvedValue({ url: "https://files/form.pdf" });

    await actAsync(() => {
      renderWithLenderProviders(<ProductsPage />);
    });
    const user = userEvent.setup();

    await user.click(screen.getByRole("button", { name: /add product/i }));
    await user.type(screen.getByLabelText(/Product name/i), "Bridge Loan");
    await user.type(screen.getByLabelText(/^Category/i), "Bridge");
    await user.click(screen.getByLabelText(/Bank Statements/i));
    await user.click(screen.getByRole("button", { name: /Add Custom Requirement/i }));
    const customInput = screen.getByPlaceholderText(/Custom document/i);
    await user.type(customInput, "CPA Letter");
    await user.click(screen.getByRole("button", { name: /Save product/i }));

    await waitFor(() => expect(createLenderProduct).toHaveBeenCalled());
    expect(updateRequiredDocuments).toHaveBeenCalledWith("p1", { categories: ["Bank Statements"], custom: ["CPA Letter"] });
  });

  it("toggles and deletes products without leaking other lender ids", async () => {
    (fetchLenderProducts as unknown as vi.Mock).mockResolvedValue([
      { id: "p2", productName: "Term Loan", category: "Term", active: true }
    ]);
    (fetchDocumentCategories as unknown as vi.Mock).mockResolvedValue([]);

    await actAsync(() => {
      renderWithLenderProviders(<ProductsPage />);
    });
    const row = await screen.findByText("Term Loan");
    const actions = row.closest("tr")!;

    await userEvent.click(within(actions).getByRole("button", { name: /Toggle/i }));
    expect(updateLenderProduct).toHaveBeenCalledWith("p2", { active: false });

    await userEvent.click(within(actions).getByRole("button", { name: /Delete/i }));
    expect(deleteLenderProduct).toHaveBeenCalledWith("p2");
    expect(fetchLenderProducts).toHaveBeenCalled();
  });
});
