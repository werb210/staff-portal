import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import LenderRoutes from "@/router/lenderRoutes";
import { lenderLogin, sendLenderOtp, verifyLenderOtp } from "@/api/lender/auth";

vi.mock("@/api/lender/auth", () => ({
  lenderLogin: vi.fn(),
  sendLenderOtp: vi.fn(),
  verifyLenderOtp: vi.fn(),
  fetchLenderProfile: vi.fn()
}));

const renderLenderRouter = () => {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={["/lender/login"]}>
        <LenderRoutes />
      </MemoryRouter>
    </QueryClientProvider>
  );
};

describe("Lender authentication flow", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  it("handles login and OTP verification with isolated storage", async () => {
    (lenderLogin as unknown as vi.Mock).mockResolvedValue({ sessionId: "sess-1", requiresOtp: true });
    (sendLenderOtp as unknown as vi.Mock).mockResolvedValue({ sent: true });
    (verifyLenderOtp as unknown as vi.Mock).mockResolvedValue({
      accessToken: "lender-access",
      refreshToken: "lender-refresh",
      user: { id: "l1", name: "Lender", email: "lender@example.com", role: "LENDER", companyName: "Acme Lending" }
    });

    renderLenderRouter();
    const user = userEvent.setup();

    await user.type(screen.getByLabelText(/Email/i), "lender@example.com");
    await user.type(screen.getByLabelText(/Password/i), "password123");
    await user.click(screen.getByRole("button", { name: /login/i }));

    await waitFor(() => expect(lenderLogin).toHaveBeenCalledWith({ email: "lender@example.com", password: "password123" }));
    expect(sendLenderOtp).toHaveBeenCalledWith("lender@example.com");

    await waitFor(() => expect(screen.getByText(/verification code/i)).toBeInTheDocument());
    await user.type(screen.getByLabelText(/6-digit code/i), "123456");
    await user.click(screen.getByRole("button", { name: /verify/i }));

    await waitFor(() =>
      expect(verifyLenderOtp).toHaveBeenCalledWith({ email: "lender@example.com", code: "123456", sessionId: "sess-1" })
    );

    const stored = JSON.parse(localStorage.getItem("lender-portal.auth") ?? "{}");
    expect(stored.tokens.accessToken).toBe("lender-access");
    expect(localStorage.getItem("staff-portal.auth")).toBeNull();
  });
});
