import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { http, HttpResponse } from "msw";
import { setupServer } from "msw/node";
import { AuthProvider, useAuth } from "@/auth/AuthContext";
import LoginPage from "@/pages/login/LoginPage";

const navigateSpy = vi.fn();

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual<typeof import("react-router-dom")>("react-router-dom");
  return {
    ...actual,
    useNavigate: () => navigateSpy
  };
});

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
    return new HttpResponse(null, { status: 200 });
  }),
  http.get("http://localhost/api/auth/me", () => {
    meSpy();
    return HttpResponse.json({ id: "u1", role: "Staff" }, { status: 200 });
  })
);

const AuthProbe = () => {
  const { authenticated, status, user } = useAuth();
  return (
    <div>
      <span data-testid="auth-status">{String(authenticated)}</span>
      <span data-testid="auth-state">{status}</span>
      <span data-testid="auth-user">{user ? JSON.stringify(user) : ""}</span>
    </div>
  );
};

describe("login contract flow", () => {
  beforeAll(() => {
    server.listen({ onUnhandledRequest: "error" });
  });

  afterEach(() => {
    server.resetHandlers();
    localStorage.clear();
    navigateSpy.mockClear();
    startOtpSpy.mockClear();
    verifyOtpSpy.mockClear();
    meSpy.mockClear();
  });

  afterAll(() => {
    server.close();
  });

  it("authenticates via OTP and navigates away from /login", async () => {
    const user = userEvent.setup();

    render(
      <AuthProvider>
        <MemoryRouter initialEntries={["/login"]}>
          <LoginPage />
          <AuthProbe />
        </MemoryRouter>
      </AuthProvider>
    );

    await user.type(screen.getByLabelText(/Phone number/i), "+15555550100");
    await user.click(screen.getByRole("button", { name: /Send code/i }));

    expect(startOtpSpy).toHaveBeenCalledTimes(1);
    expect(startOtpSpy).toHaveBeenCalledWith({ phone: "+15555550100" });
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();

    const otpInput = await screen.findByLabelText(/Verification code/i);
    await user.type(otpInput, "123456");
    await user.click(screen.getByRole("button", { name: /Verify code/i }));

    await waitFor(() => {
      expect(verifyOtpSpy).toHaveBeenCalledTimes(1);
      expect(verifyOtpSpy).toHaveBeenCalledWith({ phone: "+15555550100", code: "123456" });
    });

    await waitFor(() => {
      expect(meSpy).toHaveBeenCalledTimes(1);
    });

    await waitFor(() => {
      expect(screen.getByTestId("auth-status")).toHaveTextContent("true");
      expect(screen.getByTestId("auth-state")).toHaveTextContent("authenticated");
      expect(screen.getByTestId("auth-user")).toHaveTextContent("\"role\":\"Staff\"");
    });

    await waitFor(() => {
      expect(navigateSpy).toHaveBeenCalledWith("/dashboard");
    });
  });
});
