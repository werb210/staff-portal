// @vitest-environment jsdom
import "@testing-library/jest-dom/vitest";
import { describe, expect, it } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter, Route, Routes, useLocation } from "react-router-dom";
import { AuthContext, type AuthContextValue } from "@/auth/AuthContext";
import PrivateRoute from "@/router/PrivateRoute";

const LocationProbe = () => {
  const location = useLocation();
  return <div data-testid="location">{location.pathname}</div>;
};

const buildAuthValue = (overrides: Partial<AuthContextValue>): AuthContextValue => ({
  authState: "authenticated",
  authStatus: "authenticated",
  rolesStatus: "resolved",
  user: { id: "user-1" },
  accessToken: "token",
  error: null,
  authenticated: true,
  isAuthenticated: true,
  authReady: true,
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

describe("route guard role handling", () => {
  it("renders the dashboard shell while roles are loading", () => {
    const authValue = buildAuthValue({
      user: { id: "user-1" },
      authState: "authenticated",
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
                <PrivateRoute allowedRoles={["Admin", "Staff"]}>
                  <div>Dashboard</div>
                </PrivateRoute>
              }
            />
            <Route path="/login" element={<div>Login</div>} />
          </Routes>
          <LocationProbe />
        </MemoryRouter>
      </AuthContext.Provider>
    );

    expect(screen.getByText("Dashboard")).toBeInTheDocument();
    expect(screen.getByTestId("location")).toHaveTextContent("/dashboard");
    expect(screen.queryByText("Login")).not.toBeInTheDocument();
  });

  it("shows AccessRestricted for authenticated users missing roles without redirecting", () => {
    const authValue = buildAuthValue({
      user: { id: "user-2", role: "Referrer" },
      rolesStatus: "resolved"
    });

    render(
      <AuthContext.Provider value={authValue}>
        <MemoryRouter initialEntries={["/dashboard"]}>
          <Routes>
            <Route
              path="/dashboard"
              element={
                <PrivateRoute allowedRoles={["Admin", "Staff"]}>
                  <div>Dashboard</div>
                </PrivateRoute>
              }
            />
            <Route path="/login" element={<div>Login</div>} />
          </Routes>
          <LocationProbe />
        </MemoryRouter>
      </AuthContext.Provider>
    );

    expect(screen.getByText("Access restricted")).toBeInTheDocument();
    expect(screen.getByTestId("location")).toHaveTextContent("/dashboard");
  });

  it("redirects unauthenticated users to /login", async () => {
    const authValue = buildAuthValue({
      authState: "unauthenticated",
      authStatus: "unauthenticated",
      rolesStatus: "resolved",
      authenticated: false,
      isAuthenticated: false,
      user: null,
      accessToken: null
    });

    render(
      <AuthContext.Provider value={authValue}>
        <MemoryRouter initialEntries={["/dashboard"]}>
          <Routes>
            <Route
              path="/dashboard"
              element={
                <PrivateRoute allowedRoles={["Admin", "Staff"]}>
                  <div>Dashboard</div>
                </PrivateRoute>
              }
            />
            <Route path="/login" element={<div>Login</div>} />
          </Routes>
          <LocationProbe />
        </MemoryRouter>
      </AuthContext.Provider>
    );

    await waitFor(() => {
      expect(screen.getByTestId("location")).toHaveTextContent("/login");
    });
  });
});
