// @vitest-environment jsdom
import { describe, expect, test, beforeEach, afterEach, vi } from "vitest";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";
import LoginPage from "./LoginPage";
import { ApiError } from "@/api/client";

let startOtpMock = vi.fn();
let verifyOtpMock = vi.fn();

vi.mock("@/auth/AuthContext", () => ({
  useAuth: () => ({
    startOtp: (...args: Parameters<typeof startOtpMock>) => startOtpMock(...args),
    verifyOtp: (...args: Parameters<typeof verifyOtpMock>) => verifyOtpMock(...args),
    pendingPhoneNumber: null
  })
}));

const navigateMock = vi.fn();

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual<typeof import("react-router-dom")>("react-router-dom");
  return {
    ...actual,
    useNavigate: () => navigateMock,
    useLocation: () => ({ state: undefined })
  };
});

describe("LoginPage", () => {
  beforeEach(() => {
    navigateMock.mockReset();
  });

  afterEach(() => {
    cleanup();
  });

  const renderLogin = (startOtp = vi.fn(), verifyOtp = vi.fn()) => {
    startOtpMock = startOtp;
    verifyOtpMock = verifyOtp;

    return render(
      <LoginPage />
    );
  };

  test("submits phone number and navigates on OTP verification", async () => {
    const startOtp = vi.fn().mockResolvedValue(undefined);
    const verifyOtp = vi.fn().mockResolvedValue({ accessToken: "token-123", user: { email: "demo@example.com" } });
    renderLogin(startOtp, verifyOtp);

    fireEvent.change(screen.getByLabelText(/Phone number/i), { target: { value: "+15555550100" } });
    fireEvent.click(screen.getByRole("button", { name: /Send code/i }));

    await waitFor(() => expect(startOtp).toHaveBeenCalledWith({ phone: "+15555550100" }));

    fireEvent.change(screen.getByLabelText(/Verification code/i), { target: { value: "123456" } });
    fireEvent.click(screen.getByRole("button", { name: /Verify code/i }));

    await waitFor(() => expect(verifyOtp).toHaveBeenCalledWith({ code: "123456", phone: "+15555550100" }));
    expect(navigateMock).toHaveBeenCalledWith("/dashboard", { replace: true });
  });

  test("shows an error when OTP verification fails", async () => {
    const startOtp = vi.fn().mockResolvedValue(undefined);
    const verifyOtp = vi.fn().mockRejectedValue(new ApiError({ status: 401, message: "Invalid code" }));
    renderLogin(startOtp, verifyOtp);

    fireEvent.change(screen.getByLabelText(/Phone number/i), { target: { value: "+15555550100" } });
    fireEvent.click(screen.getByRole("button", { name: /Send code/i }));
    await waitFor(() => expect(startOtp).toHaveBeenCalled());

    fireEvent.change(screen.getByLabelText(/Verification code/i), { target: { value: "000000" } });
    fireEvent.click(screen.getByRole("button", { name: /Verify code/i }));

    await waitFor(() => expect(verifyOtp).toHaveBeenCalled());
    expect(navigateMock).not.toHaveBeenCalled();
    await waitFor(() => expect(screen.getByText(/Invalid code/i)).toBeInTheDocument());
  });
});
