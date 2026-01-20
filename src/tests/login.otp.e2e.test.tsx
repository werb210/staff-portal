// @vitest-environment jsdom
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { http, HttpResponse } from "msw";
import { setupServer } from "msw/node";
import { MemoryRouter, Route, Routes, useLocation } from "react-router-dom";
import { AuthProvider, useAuth } from "@/auth/AuthContext";
import LoginPage from "@/pages/login/LoginPage";
import { clearStoredAuth } from "@/services/token";

const startOtpSpy = vi.fn();
const verifyOtpSpy = vi.fn();
const meSpy = vi.fn();

const server = setupServer(
  http.post("http://localhost/api/auth/otp/start", async ({ request }) => {
    startOtpSpy(await request.json());
    return new HttpResponse(null, {
      status: 204,
      headers: {
        "x-twilio-sid": "twilio-sid"
      }
    });
  }),
  http.post("http://localhost/api/auth/otp/verify", async ({ request }) => {
    verifyOtpSpy(await request.json());
    return HttpResponse.json({ accessToken: "access-token", refreshToken: "refresh-token" });
  }),
  http.get("http://localhost/api/auth/me", () => {
    meSpy();
    return HttpResponse.json({ id: "u1", role: "Staff" }, { status: 200 });
  })
);

const AuthProbe = () => {
  const { authenticated } = useAuth();
  return <span data-testid="auth-authenticated">{String(authenticated)}</span>;
};

const LocationProbe = () => {
  const location = useLocation();
  return <span data-testid="location-path">{location.pathname}</span>;
};

const TestApp = ({ initialEntries = ["/login"] }: { initialEntries?: string[] }) => (
  <AuthProvider>
    <MemoryRouter initialEntries={initialEntries}>
      <LocationProbe />
      <AuthProbe />
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/dashboard" element={<h2>Dashboard Overview</h2>} />
      </Routes>
    </MemoryRouter>
  </AuthProvider>
);

const startOtp = async (user: ReturnType<typeof userEvent.setup>) => {
  await user.type(screen.getByLabelText(/phone number/i), "+15555550100");
  await user.click(screen.getByRole("button", { name: /send code/i }));
};

describe("OTP login flow end-to-end", () => {
  let consoleErrorSpy: ReturnType<typeof vi.spyOn>;

  beforeAll(() => {
    server.listen({ onUnhandledRequest: "error" });
  });

  beforeEach(() => {
    consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => undefined);
  });

  afterEach(() => {
    expect(consoleErrorSpy).not.toHaveBeenCalled();
    consoleErrorSpy.mockRestore();
    server.resetHandlers();
    clearStoredAuth();
    startOtpSpy.mockClear();
    verifyOtpSpy.mockClear();
    meSpy.mockClear();
  });

  afterAll(() => {
    server.close();
  });

  it("TEST 1 — LOGIN PAGE RENDERS", () => {
    render(<TestApp />);

    expect(screen.getByLabelText(/phone number/i)).toBeVisible();
    expect(screen.getByRole("button", { name: /send code/i })).toBeVisible();
  });

  it("TEST 2 — OTP REQUEST", async () => {
    const user = userEvent.setup();

    render(<TestApp />);

    await startOtp(user);

    await waitFor(() => {
      expect(startOtpSpy).toHaveBeenCalledTimes(1);
      expect(startOtpSpy).toHaveBeenCalledWith({ phone: "+15555550100" });
    });

    expect(await screen.findByLabelText(/verification code/i)).toBeVisible();
  });

  it("TEST 3 — OTP VERIFY", async () => {
    const user = userEvent.setup();

    render(<TestApp />);

    await startOtp(user);

    const otpInput = await screen.findByLabelText(/verification code/i);
    await user.type(otpInput, "123456");
    await user.click(screen.getByRole("button", { name: /verify code/i }));

    await waitFor(() => {
      expect(verifyOtpSpy).toHaveBeenCalledTimes(1);
      expect(verifyOtpSpy).toHaveBeenCalledWith({ phone: "+15555550100", code: "123456" });
    });

    await waitFor(() => {
      expect(meSpy).toHaveBeenCalledTimes(1);
    });

    await waitFor(() => {
      expect(screen.getByTestId("auth-authenticated")).toHaveTextContent("true");
    });
  });

  it("TEST 4 — POST LOGIN ROUTE", async () => {
    const user = userEvent.setup();

    render(<TestApp />);

    await startOtp(user);

    const otpInput = await screen.findByLabelText(/verification code/i);
    await user.type(otpInput, "123456");
    await user.click(screen.getByRole("button", { name: /verify code/i }));

    await waitFor(() => {
      expect(screen.getByTestId("location-path")).toHaveTextContent("/dashboard");
    });

    await waitFor(() => {
      expect(screen.getByRole("heading", { name: /dashboard overview/i })).toBeVisible();
    });
  });
});
