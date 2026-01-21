// @vitest-environment jsdom
import "@testing-library/jest-dom/vitest";
import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { AuthContext, type AuthContextValue } from "@/auth/AuthContext";
import { ProtectedRoute } from "@/routes/ProtectedRoute";

const buildAuthValue = (overrides: Partial<AuthContextValue>): AuthContextValue => ({
  authStatus: "authenticated",
  rolesStatus: "loading",
  user: { id: "user-1" },
  accessToken: "token",
  error: null,
  authenticated: true,
  isAuthenticated: true,
  authReady: true,
  pendingPhoneNumber: null,
  startOtp: async () => undefined,
  verifyOtp: async () => undefined,
  login: async () => undefined,
  setAuth: () => undefined,
  setAuthenticated: () => undefined,
  refreshUser: async () => false,
  logout: async () => undefined,
  ...overrides
});

describe("auth guard", () => {
  it("allows rendering while roles are loading for authenticated users", () => {
    const authValue = buildAuthValue({
      authStatus: "authenticated",
      rolesStatus: "loading"
    });

    render(
      <AuthContext.Provider value={authValue}>
        <MemoryRouter initialEntries={["/dashboard"]}>
          <Routes>
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <div>Dashboard</div>
                </ProtectedRoute>
              }
            />
          </Routes>
        </MemoryRouter>
      </AuthContext.Provider>
    );

    expect(screen.getByText("Dashboard")).toBeInTheDocument();
  });
});
