// @vitest-environment jsdom
import "@testing-library/jest-dom/vitest";
import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { http, HttpResponse } from "msw";
import { setupServer } from "msw/node";
import { AuthProvider, useAuth } from "@/auth/AuthContext";
import LoginPage from "@/pages/login/LoginPage";
import api from "@/api/client";
import { ACCESS_TOKEN_KEY } from "@/services/token";
import * as apiService from "@/services/api";

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
let lendersAuthHeader: string | null = null;

const createValidToken = (overrides?: Record<string, unknown>) => {
  const now = Math.floor(Date.now() / 1000);
  const payload = {
    id: "1",
    sub: "1",
    role: "Staff",
    exp: now + 3600,
    iat: now,
    ...overrides
  };
  const payloadEncoded = btoa(JSON.stringify(payload))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
  return `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.${payloadEncoded}.signature`;
};

const fakeToken = createValidToken();

const server = setupServer(
  http.post("http://localhost/api/auth/otp/start", async ({ request }) => {
    startOtpSpy(await request.json());
    return new HttpResponse(null, { status: 204 });
  }),
  http.post("http://localhost/api/auth/otp/verify", async ({ request }) => {
    verifyOtpSpy(await request.json());
    return HttpResponse.json(
      {
        token: fakeToken,
        user: { id: "1", role: "Staff" }
      },
      { status: 200 }
    );
  }),
  http.get("http://localhost/api/lenders", ({ request }) => {
    lendersAuthHeader = request.headers.get("authorization");
    return HttpResponse.json([], { status: 200 });
  })
);

const AuthProbe = () => {
  const { authenticated, user } = useAuth();
  return (
    <div>
      <span data-testid="auth-authenticated">{String(authenticated)}</span>
      <span data-testid="auth-user">{user ? JSON.stringify(user) : ""}</span>
    </div>
  );
};

const TestApp = () => (
  <AuthProvider>
    <MemoryRouter initialEntries={["/login"]}>
      <LoginPage />
      <AuthProbe />
    </MemoryRouter>
  </AuthProvider>
);

describe("auth server contract", () => {
  beforeAll(() => {
    server.listen({ onUnhandledRequest: "error" });
  });

  afterEach(() => {
    server.resetHandlers();
    localStorage.clear();
    navigateSpy.mockClear();
    startOtpSpy.mockClear();
    verifyOtpSpy.mockClear();
    lendersAuthHeader = null;
    window.history.pushState({}, "", "/");
    vi.restoreAllMocks();
  });

  afterAll(() => {
    server.close();
  });

  it("TEST 1 — LOGIN PAGE RENDERS", () => {
    const consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => undefined);

    render(<TestApp />);

    expect(screen.getByLabelText(/phone number/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /send code/i })).toBeInTheDocument();
    expect(consoleErrorSpy).not.toHaveBeenCalled();

    consoleErrorSpy.mockRestore();
  });

  it("TEST 2 — OTP START REQUEST", async () => {
    const user = userEvent.setup();

    render(<TestApp />);

    await user.type(screen.getByLabelText(/phone number/i), "+15555550100");
    await user.click(screen.getByRole("button", { name: /send code/i }));

    await waitFor(() => {
      expect(startOtpSpy).toHaveBeenCalledTimes(1);
      expect(startOtpSpy).toHaveBeenCalledWith({ phone: "+15555550100" });
    });

    expect(await screen.findByLabelText(/verification code/i)).toBeInTheDocument();
  });

  it("TEST 3 — CODE ENTRY UI", async () => {
    const user = userEvent.setup();

    render(<TestApp />);

    await user.type(screen.getByLabelText(/phone number/i), "+15555550100");
    await user.click(screen.getByRole("button", { name: /send code/i }));

    expect(await screen.findByLabelText(/verification code/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /resend code/i })).toBeInTheDocument();
    expect(screen.queryByLabelText(/phone number/i)).not.toBeInTheDocument();
  });

  it("TEST 4 — OTP VERIFY (200 RESPONSE)", async () => {
    const user = userEvent.setup();

    render(<TestApp />);

    await user.type(screen.getByLabelText(/phone number/i), "+15555550100");
    await user.click(screen.getByRole("button", { name: /send code/i }));

    const otpInput = await screen.findByLabelText(/verification code/i);
    await user.type(otpInput, "123456");
    await user.click(screen.getByRole("button", { name: /verify code/i }));

    await waitFor(() => {
      expect(verifyOtpSpy).toHaveBeenCalledTimes(1);
      expect(verifyOtpSpy).toHaveBeenCalledWith({ phone: "+15555550100", code: "123456" });
    });

    await waitFor(() => {
      expect(localStorage.getItem(ACCESS_TOKEN_KEY)).toBe(fakeToken);
    });

    await waitFor(() => {
      expect(screen.getByTestId("auth-authenticated")).toHaveTextContent("true");
    });

    await waitFor(() => {
      expect(navigateSpy).toHaveBeenCalledWith("/");
    });
  });

  it("TEST 5 — OTP VERIFY (204 RESPONSE)", async () => {
    const user = userEvent.setup();
    const storedToken = createValidToken({ id: "1", role: "Staff", sub: "1" });
    localStorage.setItem(ACCESS_TOKEN_KEY, storedToken);

    server.use(
      http.post("http://localhost/api/auth/otp/verify", async ({ request }) => {
        verifyOtpSpy(await request.json());
        return new HttpResponse(null, { status: 204 });
      })
    );

    render(<TestApp />);

    await user.type(screen.getByLabelText(/phone number/i), "+15555550100");
    await user.click(screen.getByRole("button", { name: /send code/i }));

    const otpInput = await screen.findByLabelText(/verification code/i);
    await user.type(otpInput, "123456");
    await user.click(screen.getByRole("button", { name: /verify code/i }));

    await waitFor(() => {
      expect(verifyOtpSpy).toHaveBeenCalledWith({ phone: "+15555550100", code: "123456" });
    });

    await waitFor(() => {
      expect(screen.getByTestId("auth-authenticated")).toHaveTextContent("true");
    });

    await waitFor(() => {
      expect(screen.getByTestId("auth-user")).toHaveTextContent("\"role\":\"Staff\"");
    });

    await waitFor(() => {
      expect(navigateSpy).toHaveBeenCalledWith("/");
    });
  });

  it("TEST 6 — AUTH HEADER INJECTION", async () => {
    localStorage.setItem(ACCESS_TOKEN_KEY, fakeToken);

    await api.get("/lenders");

    expect(lendersAuthHeader).toBe(`Bearer ${fakeToken}`);
  });

  it("TEST 7 — NO REDIRECT LOOP", async () => {
    const redirectSpy = vi.spyOn(apiService, "redirectToLogin");
    const swallowUnhandled = (event: PromiseRejectionEvent) => {
      event.preventDefault();
      event.stopImmediatePropagation();
    };
    window.addEventListener("unhandledrejection", swallowUnhandled, { capture: true });

    server.use(
      http.get("http://localhost/api/lenders", () => new HttpResponse(null, { status: 401 }))
    );

    try {
      localStorage.setItem(ACCESS_TOKEN_KEY, fakeToken);
      window.history.pushState({}, "", "/lenders");

      let firstError: unknown = null;
      try {
        await api.get("/lenders");
      } catch (error) {
        firstError = error;
      }

      expect(localStorage.getItem(ACCESS_TOKEN_KEY)).toBeNull();
      expect(redirectSpy).toHaveBeenCalledTimes(1);

      let secondError: unknown = null;
      try {
        await api.get("/lenders");
      } catch (error) {
        secondError = error;
      }
      expect(redirectSpy).toHaveBeenCalledTimes(1);
      expect(firstError).toBeTruthy();
      expect(secondError).toBeTruthy();
    } finally {
      window.removeEventListener("unhandledrejection", swallowUnhandled, { capture: true });
    }
  });
});
