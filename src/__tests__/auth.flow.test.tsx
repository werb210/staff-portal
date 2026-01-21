// @vitest-environment jsdom
import "@testing-library/jest-dom/vitest";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter, Route, Routes, useLocation } from "react-router-dom";
import { AuthProvider } from "@/auth/AuthContext";
import PrivateRoute from "@/router/PrivateRoute";
import { fetchCurrentUser } from "@/api/auth";
import { clearStoredAuth, setStoredAccessToken } from "@/services/token";

vi.mock("@/api/auth", () => ({
  fetchCurrentUser: vi.fn()
}));

const mockedFetchCurrentUser = vi.mocked(fetchCurrentUser);

const LocationProbe = () => {
  const location = useLocation();
  return <span data-testid="location">{location.pathname}</span>;
};

describe("auth flow access gating", () => {
  afterEach(() => {
    clearStoredAuth();
  });

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders the dashboard while roles are unresolved after /api/auth/me", async () => {
    setStoredAccessToken("test-token");
    let resolveUser: ((value: { data: { id: string; role: string } }) => void) | undefined;
    const pendingUser = new Promise<{ data: { id: string; role: string } }>((resolve) => {
      resolveUser = resolve;
    });
    mockedFetchCurrentUser.mockReturnValue(pendingUser as any);

    render(
      <MemoryRouter initialEntries={["/dashboard"]}>
        <AuthProvider>
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
        </AuthProvider>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText("Dashboard")).toBeInTheDocument();
    });

    expect(screen.getByTestId("location")).toHaveTextContent("/dashboard");
    expect(screen.queryByText("Access restricted")).not.toBeInTheDocument();
    expect(screen.queryByText("Login")).not.toBeInTheDocument();

    resolveUser?.({ data: { id: "1", role: "Staff" } });
  });
});
