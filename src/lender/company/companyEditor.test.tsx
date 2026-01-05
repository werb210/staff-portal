import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { MockedFunction } from "vitest";
import CompanyEditor from "./CompanyEditor";
import { fetchLenderCompany, updateLenderCompany, uploadLenderLogo } from "@/api/lender/company";
import { renderWithLenderProviders } from "@/test/testUtils";

vi.mock("@/api/lender/company", () => ({
  fetchLenderCompany: vi.fn(),
  updateLenderCompany: vi.fn(),
  uploadLenderLogo: vi.fn()
}));

describe("Company editor", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("loads and updates company profile with validation", async () => {
    (fetchLenderCompany as MockedFunction<typeof fetchLenderCompany>).mockResolvedValue({
      id: "c1",
      companyName: "Summit Lending",
      supportEmail: "support@summit.com",
      supportPhone: "555-1111"
    });
    (updateLenderCompany as MockedFunction<typeof updateLenderCompany>).mockResolvedValue({
      id: "c1",
      companyName: "Summit Lending",
      supportEmail: "support@summit.com",
      supportPhone: "555-2222"
    });
    const user = userEvent.setup();

    renderWithLenderProviders(<CompanyEditor />);

    await waitFor(() => expect(screen.getByLabelText(/Company name/i)).toBeInTheDocument());
    await user.clear(screen.getByLabelText(/Support phone/i));
    await user.type(screen.getByLabelText(/Support phone/i), "555-2222");
    await user.click(screen.getByRole("button", { name: /save/i }));

    await waitFor(() => {
      const firstCall = (updateLenderCompany as MockedFunction<typeof updateLenderCompany>).mock.calls[0]?.[0];
      expect(firstCall).toEqual(
        expect.objectContaining({
          id: "c1",
          companyName: "Summit Lending",
          supportEmail: "support@summit.com",
          supportPhone: "555-2222"
        })
      );
    });
  });

  it("uploads a logo and surfaces the new url", async () => {
    (fetchLenderCompany as MockedFunction<typeof fetchLenderCompany>).mockResolvedValue({
      id: "c1",
      companyName: "Summit Lending",
      supportEmail: "support@summit.com",
      supportPhone: "555-1111"
    });
    (uploadLenderLogo as MockedFunction<typeof uploadLenderLogo>).mockResolvedValue({ url: "https://blob/logo.png" });
    const file = new File(["logo"], "logo.png", { type: "image/png" });

    renderWithLenderProviders(<CompanyEditor />);
    await waitFor(() => expect(screen.getByLabelText(/Logo/i)).toBeInTheDocument());
    const input = screen.getByLabelText(/Logo/i) as HTMLInputElement;
    await userEvent.upload(input, file);

    expect(uploadLenderLogo).toHaveBeenCalledWith(file);
  });
});
