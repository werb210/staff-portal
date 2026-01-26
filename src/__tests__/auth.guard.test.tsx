// @vitest-environment jsdom
import "@testing-library/jest-dom/vitest";
import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { AuthContext, type AuthContextValue } from "@/auth/AuthContext";
import PrivateRoute from "@/router/PrivateRoute";

const buildAuthValue = (overrides: Partial<AuthContextValue>): AuthContextValue => ({
  authState: "authenticated",
  authStatus: "authenticated",
  rolesStatus: "loading",
  user: { id: "user-1" },
  accessToken: "token",
  error: null,
  authenticated: true,
  isAuthenticated: true,
  authReady: true,
  isHydratingSession: false,
  pendingPhoneNumber: null,
  startOtp: async () => true,
  verifyOtp: async () => true,
  login: async () => undefined,
  setAuth: () => undefined,
  setUser: () => undefined,
  setAuthenticated: () => undefined,
  setAuthState: () => undefined,
  clearAuth: () => undefined,
  refreshUser: async () => false,
  logout: async () => undefined,
  ...overrides
});

describe("auth guard", () => {
  it("blocks rendering while auth is loading", () => {
    const authValue = buildAuthValue({
      authState: "loading",
      authStatus: "loading",
      rolesStatus: "loading"
    });

    render(
      <AuthContext.Provider value={authValue}>
        <MemoryRouter initialEntries={["/dashboard"]}>
          <Routes>
            <Route
              path="/dashboard"
              element={
                <PrivateRoute>
                  <div>Dashboard</div>
                </PrivateRoute>
              }
            />
          </Routes>
        </MemoryRouter>
      </AuthContext.Provider>
    );

    expect(screen.queryByText("Dashboard")).not.toBeInTheDocument();
  });
});
