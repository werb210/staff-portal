// @vitest-environment jsdom
import { describe, expect, test, afterEach, vi } from "vitest";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";
import LoginPage from "./LoginPage";
import { ApiError } from "@/api/http";
import { MemoryRouter } from "react-router-dom";

let startOtpMock = vi.fn();
let verifyOtpMock = vi.fn();

vi.mock("@/auth/AuthContext", () => ({
  useAuth: () => ({
    startOtp: (...args: Parameters<typeof startOtpMock>) => startOtpMock(...args),
    verifyOtp: (...args: Parameters<typeof verifyOtpMock>) => verifyOtpMock(...args),
    status: "unauthenticated",
    error: null
  })
}));

describe("LoginPage", () => {
  afterEach(() => {
    cleanup();
  });

  const renderLogin = (startOtp = vi.fn(), verifyOtp = vi.fn()) => {
    startOtpMock = startOtp;
    verifyOtpMock = verifyOtp;

    return render(
      <MemoryRouter>
        <LoginPage />
      </MemoryRouter>
    );
  };

  test("submits phone number and verifies OTP", async () => {
    const startOtp = vi.fn().mockResolvedValue(undefined);
    const verifyOtp = vi.fn().mockResolvedValue(undefined);
    renderLogin(startOtp, verifyOtp);

    fireEvent.change(screen.getByLabelText(/Phone number/i), { target: { value: "+1 (555) 555-0100" } });
    fireEvent.click(screen.getByRole("button", { name: /Send code/i }));

    await waitFor(() => expect(startOtp).toHaveBeenCalledWith({ phone: "+15555550100" }));

    fireEvent.change(screen.getByLabelText(/Verification code/i), { target: { value: "123456" } });
    fireEvent.click(screen.getByRole("button", { name: /Verify code/i }));

    await waitFor(() => expect(verifyOtp).toHaveBeenCalledWith({ code: "123456", phone: "+15555550100" }));
  });

  test("does not show an error when OTP verification succeeds", async () => {
    const startOtp = vi.fn().mockResolvedValue(undefined);
    const verifyOtp = vi.fn().mockResolvedValue(undefined);
    renderLogin(startOtp, verifyOtp);

    fireEvent.change(screen.getByLabelText(/Phone number/i), { target: { value: "+1 (555) 555-0100" } });
    fireEvent.click(screen.getByRole("button", { name: /Send code/i }));

    await waitFor(() => expect(startOtp).toHaveBeenCalledWith({ phone: "+15555550100" }));

    fireEvent.change(screen.getByLabelText(/Verification code/i), { target: { value: "123456" } });
    fireEvent.click(screen.getByRole("button", { name: /Verify code/i }));

    await waitFor(() => expect(verifyOtp).toHaveBeenCalledWith({ code: "123456", phone: "+15555550100" }));
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });

  test("shows an error when OTP verification fails", async () => {
    const startOtp = vi.fn().mockResolvedValue(undefined);
    const verifyOtp = vi
      .fn()
      .mockRejectedValue(new ApiError({ status: 401, message: "Invalid code", requestId: "req-401" }));
    renderLogin(startOtp, verifyOtp);

    fireEvent.change(screen.getByLabelText(/Phone number/i), { target: { value: "+15555550100" } });
    fireEvent.click(screen.getByRole("button", { name: /Send code/i }));
    await waitFor(() => expect(startOtp).toHaveBeenCalled());

    fireEvent.change(screen.getByLabelText(/Verification code/i), { target: { value: "000000" } });
    fireEvent.click(screen.getByRole("button", { name: /Verify code/i }));

    await waitFor(() => expect(verifyOtp).toHaveBeenCalled());
    await waitFor(() => expect(screen.getByText(/Invalid code/i)).toBeInTheDocument());
    expect(screen.getByText(/Request ID: req-401/i)).toBeInTheDocument();
    expect(screen.getByText(/Endpoint: \/auth\/otp\/verify/i)).toBeInTheDocument();
  });

  test("shows server error details when OTP start fails", async () => {
    const startOtp = vi.fn().mockRejectedValue(
      new ApiError({ status: 400, message: "Phone blocked", requestId: "req-123" })
    );
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => undefined);
    renderLogin(startOtp, vi.fn());

    fireEvent.change(screen.getByLabelText(/Phone number/i), { target: { value: "+15555550100" } });
    fireEvent.click(screen.getByRole("button", { name: /Send code/i }));

    await waitFor(() => expect(startOtp).toHaveBeenCalled());
    expect(await screen.findByText(/Phone blocked/i)).toBeInTheDocument();
    expect(screen.getByText(/Request ID: req-123/i)).toBeInTheDocument();
    expect(screen.getByText(/Endpoint: \/auth\/otp\/start/i)).toBeInTheDocument();
    expect(consoleSpy).toHaveBeenCalledWith(
      "OTP start failed.",
      expect.objectContaining({ requestId: "req-123" })
    );

    consoleSpy.mockRestore();
  });

  test("shows CORS guidance when OTP start fails with a network error", async () => {
    const networkError = Object.assign(new Error("Network Error"), {
      code: "ERR_NETWORK",
      isAxiosError: true
    });
    const startOtp = vi.fn().mockRejectedValue(networkError);
    renderLogin(startOtp, vi.fn());

    fireEvent.change(screen.getByLabelText(/Phone number/i), { target: { value: "+15555550100" } });
    fireEvent.click(screen.getByRole("button", { name: /Send code/i }));

    expect(screen.getByRole("button", { name: /Send code/i })).toBeDisabled();
    expect(await screen.findByText(/Request blocked by browser \(CORS\)/i)).toBeInTheDocument();
    expect(screen.getByText(/Request ID:/i)).toBeInTheDocument();
    expect(screen.getByText(/Endpoint: \/auth\/otp\/start/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Send code/i })).toBeEnabled();
  });
});
