import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import OfferUploader from "@/components/offers/OfferUploader";
import { renderWithProviders } from "@/test/testUtils";

const mocks = vi.hoisted(() => ({ post: vi.fn().mockResolvedValue({}) }));

vi.mock("@/api/httpClient", () => ({
  apiClient: { post: mocks.post }
}));

describe("OfferUploader", () => {
  it("uploads offer", async () => {
    renderWithProviders(<OfferUploader applicationId="app-1" />);
    await userEvent.type(screen.getByPlaceholderText("Lender"), "FundCo");
    await userEvent.type(screen.getByPlaceholderText("Amount"), "100000");
    await userEvent.type(screen.getByPlaceholderText("Rate/Factor"), "1.3");
    await userEvent.type(screen.getByPlaceholderText("Term"), "12m");
    await userEvent.type(screen.getByPlaceholderText("Payment Frequency"), "Weekly");
    const expiryInput = document.querySelector('input[name="expiry"]') as HTMLInputElement;
    await userEvent.type(expiryInput, "2026-12-31");
    const file = new File(["pdf"], "offer.pdf", { type: "application/pdf" });
    const fileInput = document.querySelector('input[name="file"]') as HTMLInputElement;
    await userEvent.upload(fileInput, file);

    await userEvent.click(screen.getByRole("button", { name: /upload offer/i }));
    await waitFor(() => expect(mocks.post).toHaveBeenCalledWith("/offers", expect.any(FormData)));
  });
});
