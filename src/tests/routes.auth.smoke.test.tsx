// @vitest-environment jsdom
import "@testing-library/jest-dom/vitest";
import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { http, HttpResponse } from "msw";
import { setupServer } from "msw/node";
import App from "@/App";
import { AuthProvider, useAuth } from "@/auth/AuthContext";
import { ACCESS_TOKEN_KEY, USER_KEY } from "@/services/token";
import { portalApiRoutes } from "@/utils/routeAudit";
import { SiloProvider } from "@/context/SiloContext";

const nowSeconds = Math.floor(Date.now() / 1000);

const createValidToken = (overrides?: Record<string, unknown>) => {
  const payload = {
    sub: "u1",
    role: "Staff",
    exp: nowSeconds + 3600,
    iat: nowSeconds,
    id: "u1",
    ...overrides
  };
  const encoded = btoa(JSON.stringify(payload))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
  return `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.${encoded}.signature`;
};

const fakeToken = createValidToken();

const server = setupServer(
  http.get("http://localhost/api/health", () => HttpResponse.json({ status: "ok" })),
  http.get("/api/_int/routes", () => HttpResponse.json({ routes: portalApiRoutes })),
  http.get("http://localhost/api/auth/me", () =>
    HttpResponse.json({ id: "u1", role: "Staff" })
  ),
  http.post("http://localhost/api/auth/otp/start", () =>
    new HttpResponse(null, {
      status: 204,
      headers: {
        "x-twilio-sid": "twilio-sid"
      }
    })
  ),
  http.post("http://localhost/api/auth/otp/verify", () =>
    HttpResponse.json(
      {
        token: fakeToken,
        user: { id: "u1", role: "Staff" }
      },
      { status: 200 }
    )
  ),
  http.get("http://localhost/api/lenders", () =>
    HttpResponse.json({ items: [] })
  )
);

const AuthProbe = () => {
  const { authenticated } = useAuth();
  return <div data-testid="auth-probe">{String(authenticated)}</div>;
};

const renderApp = (initialRoute: string, includeProbe = false) => {
  window.history.pushState({}, "", initialRoute);
  return render(
    <SiloProvider>
      <AuthProvider>
        {includeProbe ? <AuthProbe /> : null}
        <App />
      </AuthProvider>
    </SiloProvider>
  );
};

describe("portal auth routing smoke tests", () => {
  beforeAll(() => {
    server.listen({ onUnhandledRequest: "error" });
  });

  afterEach(() => {
    server.resetHandlers();
    localStorage.clear();
    cleanup();
    vi.restoreAllMocks();
  });

  afterAll(() => {
    server.close();
  });

  it("redirects unauthenticated users from / to /login", async () => {
    renderApp("/");

    await waitFor(() => {
      expect(window.location.pathname).toBe("/login");
    });

    expect(
      await screen.findByRole("heading", { name: /staff login/i })
    ).toBeInTheDocument();
  });

  it("allows authenticated users to access protected routes", async () => {
    const tokenPayload = {
      sub: "u1",
      role: "Staff",
      exp: nowSeconds + 3600,
      iat: nowSeconds,
      id: "u1"
    };
    const atobSpy = vi
      .spyOn(globalThis, "atob")
      .mockImplementation(() => JSON.stringify(tokenPayload));

    localStorage.setItem(ACCESS_TOKEN_KEY, fakeToken);

    renderApp("/");

    await waitFor(() => {
      expect(window.location.pathname).not.toBe("/login");
    });

    expect(
      await screen.findByText(/dashboard overview/i)
    ).toBeInTheDocument();
    expect(window.location.pathname).toBe("/");

    atobSpy.mockRestore();
  });

  it("navigates away from /login after OTP login", async () => {
    const user = userEvent.setup();

    renderApp("/login", true);

    await user.type(screen.getByLabelText(/phone number/i), "+15555550100");
    await user.click(screen.getByRole("button", { name: /send code/i }));

    const otpInput = await screen.findByLabelText(/verification code/i);
    await user.type(otpInput, "123456");
    await user.click(screen.getByRole("button", { name: /verify code/i }));

    await waitFor(() => {
      expect(window.location.pathname).not.toBe("/login");
    });

    await waitFor(() => {
      expect(screen.getByTestId("auth-probe")).toHaveTextContent("true");
    });

    await waitFor(() => {
      expect(window.location.pathname).toBe("/");
    });
  });

  it("keeps authenticated users on /lenders after a hard refresh", async () => {
    const consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => undefined);
    localStorage.setItem(ACCESS_TOKEN_KEY, createValidToken());
    localStorage.setItem(USER_KEY, JSON.stringify({ id: "u1", role: "Staff" }));

    renderApp("/lenders");

    await waitFor(() => {
      expect(window.location.pathname).toBe("/lenders");
    });

    expect(
      await screen.findByText(/no lender profiles available/i)
    ).toBeInTheDocument();
    expect(consoleErrorSpy).not.toHaveBeenCalled();
  });
});
