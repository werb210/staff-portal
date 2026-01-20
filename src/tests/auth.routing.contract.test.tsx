// @vitest-environment jsdom
import "@testing-library/jest-dom/vitest";
import { useEffect } from "react";
import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter, Route, Routes, useLocation } from "react-router-dom";
import { http, HttpResponse } from "msw";
import { setupServer } from "msw/node";
import { AuthContext, type AuthContextValue, AuthProvider } from "@/auth/AuthContext";
import LoginPage from "@/pages/login/LoginPage";
import RequireAuth from "@/routes/RequireAuth";
import api from "@/api/client";
import { ACCESS_TOKEN_KEY } from "@/services/token";

const createValidToken = (overrides?: Record<string, unknown>) => {
  const now = Math.floor(Date.now() / 1000);
  const payload = {
    sub: "u1",
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

const LocationProbe = () => {
  const location = useLocation();
  return <div data-testid="location">{location.pathname}</div>;
};

const server = setupServer();

describe("auth routing contract", () => {
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

  it("redirects authenticated users away from /login", async () => {
    localStorage.setItem(ACCESS_TOKEN_KEY, createValidToken());

    render(
      <AuthProvider>
        <MemoryRouter initialEntries={["/login"]}>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/" element={<div>Dashboard</div>} />
          </Routes>
          <LocationProbe />
        </MemoryRouter>
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId("location")).toHaveTextContent("/");
    });

    expect(screen.queryByRole("heading", { name: /staff login/i })).not.toBeInTheDocument();
  });

  it("blocks unauthenticated users from private routes without firing API calls", async () => {
    const lendersSpy = vi.fn();
    server.use(
      http.get("http://localhost/api/lenders", () => {
        lendersSpy();
        return HttpResponse.json({ items: [] });
      })
    );

    const ProtectedCallsApi = () => {
      useEffect(() => {
        void api.get("/lenders");
      }, []);
      return <div>Private Lenders</div>;
    };

    render(
      <AuthProvider>
        <MemoryRouter initialEntries={["/lenders"]}>
          <Routes>
            <Route
              path="/lenders"
              element={
                <RequireAuth>
                  <ProtectedCallsApi />
                </RequireAuth>
              }
            />
            <Route path="/login" element={<div>Login</div>} />
          </Routes>
          <LocationProbe />
        </MemoryRouter>
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId("location")).toHaveTextContent("/login");
    });

    expect(lendersSpy).not.toHaveBeenCalled();
  });

  it("shows a loader while auth is not ready and avoids redirects", () => {
    const authValue: AuthContextValue = {
      status: "loading",
      user: null,
      token: null,
      error: null,
      authenticated: false,
      authReady: false,
      pendingPhoneNumber: null,
      startOtp: async () => undefined,
      verifyOtp: async () => undefined,
      setAuth: () => undefined,
      setAuthenticated: () => undefined,
      refreshUser: async () => false,
      logout: async () => undefined
    };

    render(
      <AuthContext.Provider value={authValue}>
        <MemoryRouter initialEntries={["/"]}>
          <Routes>
            <Route
              path="/"
              element={
                <RequireAuth>
                  <div>Home</div>
                </RequireAuth>
              }
            />
          </Routes>
          <LocationProbe />
        </MemoryRouter>
      </AuthContext.Provider>
    );

    expect(screen.getByText("Loading experience...")).toBeInTheDocument();
    expect(screen.getByTestId("location")).toHaveTextContent("/");
  });

  it("clears tokens and redirects to /login after a 401 response", async () => {
    let callCount = 0;
    server.use(
      http.get("http://localhost/api/secure", () => {
        callCount += 1;
        if (callCount === 1) {
          return new HttpResponse(null, { status: 401 });
        }
        return HttpResponse.json({ ok: true });
      })
    );

    localStorage.setItem(ACCESS_TOKEN_KEY, createValidToken());
    window.history.pushState({}, "", "/lenders");

    await expect(api.get("/secure")).rejects.toBeTruthy();

    await waitFor(() => {
      expect(window.location.pathname).toBe("/login");
    });
    expect(localStorage.getItem(ACCESS_TOKEN_KEY)).toBeNull();

    await expect(api.get("/secure")).resolves.toBeTruthy();
    expect(window.location.pathname).toBe("/login");
  });
});
