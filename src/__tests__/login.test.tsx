// @vitest-environment jsdom
import "@testing-library/jest-dom/vitest";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { AuthProvider } from "@/auth/AuthContext";
import LoginPage from "@/pages/login/LoginPage";
import { verifyOtp as verifyOtpService, startOtp as startOtpService } from "@/services/auth";

vi.mock("@/services/auth", () => ({
  startOtp: vi.fn(),
  verifyOtp: vi.fn(),
  logout: vi.fn()
}));

const mockedStartOtp = vi.mocked(startOtpService);
const mockedVerifyOtp = vi.mocked(verifyOtpService);

const renderLoginFlow = () =>
  render(
    <AuthProvider>
      <MemoryRouter initialEntries={["/login"]}>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/dashboard" element={<div>Dashboard</div>} />
        </Routes>
      </MemoryRouter>
    </AuthProvider>
  );

describe("login flow", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("navigates to dashboard after OTP verification", async () => {
    mockedStartOtp.mockResolvedValue(null);
    mockedVerifyOtp.mockResolvedValue({ accessToken: "access", refreshToken: "refresh" });
    const fetchSpy = vi
      .fn()
      .mockResolvedValue(
        new Response(JSON.stringify({ id: "1", role: "Staff" }), {
          status: 200,
          headers: { "content-type": "application/json" }
        })
      );
    vi.stubGlobal("fetch", fetchSpy);

    renderLoginFlow();

    fireEvent.change(screen.getByLabelText(/Phone number/i), { target: { value: "+1 (555) 555-0100" } });
    fireEvent.click(screen.getByRole("button", { name: /Send code/i }));

    await waitFor(() => expect(mockedStartOtp).toHaveBeenCalled());

    fireEvent.change(screen.getByLabelText(/Verification code/i), { target: { value: "123456" } });
    fireEvent.click(screen.getByRole("button", { name: /Verify code/i }));

    await waitFor(() => expect(mockedVerifyOtp).toHaveBeenCalled());
    await waitFor(() => expect(screen.getByText("Dashboard")).toBeInTheDocument());
  });
});
