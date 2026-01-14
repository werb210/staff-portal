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

describe("LoginPage", () => {
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

    fireEvent.change(screen.getByLabelText(/Phone number/i), { target: { value: "+1 (555) 555-0100" } });
    fireEvent.click(screen.getByRole("button", { name: /Send code/i }));

    await waitFor(() => expect(startOtp).toHaveBeenCalledWith({ phone: "+15555550100" }));

    fireEvent.change(screen.getByLabelText(/Verification code/i), { target: { value: "123456" } });
    fireEvent.click(screen.getByRole("button", { name: /Verify code/i }));

    await waitFor(() => expect(verifyOtp).toHaveBeenCalledWith({ code: "123456", phone: "+15555550100" }));
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
  });

  test("flags invalid phone numbers immediately", async () => {
    const startOtp = vi.fn();
    renderLogin(startOtp, vi.fn());

    fireEvent.change(screen.getByLabelText(/Phone number/i), { target: { value: "555-0100" } });

    expect(screen.getByText(/Invalid phone number\. Enter a valid phone number\./i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Send code/i })).toBeEnabled();

    fireEvent.click(screen.getByRole("button", { name: /Send code/i }));

    await waitFor(() => expect(startOtp).not.toHaveBeenCalled());
    expect(screen.getByText(/Invalid phone number\. Enter a valid phone number\./i)).toBeInTheDocument();
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
    expect(consoleSpy).toHaveBeenCalledWith(
      "OTP start failed.",
      expect.objectContaining({ requestId: "req-123" })
    );

    consoleSpy.mockRestore();
  });

  test("shows generic error for server failures without details and does not retry verify", async () => {
    const startOtp = vi.fn().mockResolvedValue(undefined);
    const verifyOtp = vi
      .fn()
      .mockRejectedValue(new ApiError({ status: 500, message: "Internal Server Error", requestId: "req-500" }));
    renderLogin(startOtp, verifyOtp);

    fireEvent.change(screen.getByLabelText(/Phone number/i), { target: { value: "+15555550100" } });
    fireEvent.click(screen.getByRole("button", { name: /Send code/i }));
    await waitFor(() => expect(startOtp).toHaveBeenCalled());

    fireEvent.change(screen.getByLabelText(/Verification code/i), { target: { value: "123456" } });
    fireEvent.click(screen.getByRole("button", { name: /Verify code/i }));

    await waitFor(() => expect(verifyOtp).toHaveBeenCalledTimes(1));
    expect(await screen.findByText(/Authentication failed\. Try again\./i)).toBeInTheDocument();
    expect(screen.getByText(/Request ID: req-500/i)).toBeInTheDocument();
  });
});
