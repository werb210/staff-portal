// @vitest-environment jsdom
import "@testing-library/jest-dom/vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import PrivateRoute from "@/router/PrivateRoute";
import { AuthProvider } from "@/auth/AuthContext";
import { setStoredAccessToken } from "@/services/token";

const makeJwt = (payload: Record<string, unknown>) => {
  const encoded = btoa(JSON.stringify(payload))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
  return `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.${encoded}.signature`;
};

const renderRoutes = (initialEntry: string) =>
  render(
    <AuthProvider>
      <MemoryRouter initialEntries={[initialEntry]}>
        <Routes>
          <Route path="/login" element={<div>Login</div>} />
          <Route
            path="/lenders"
            element={
              <PrivateRoute>
                <div>Protected</div>
              </PrivateRoute>
            }
          />
        </Routes>
      </MemoryRouter>
    </AuthProvider>
  );

beforeEach(() => {
  localStorage.clear();
});

afterEach(() => {
  localStorage.clear();
});

describe("lender route access", () => {
  it("redirects unauthenticated users to login", async () => {
    renderRoutes("/lenders");

    await waitFor(() => expect(screen.getByText("Login")).toBeInTheDocument());
  });

  it("allows authenticated users onto lender routes", async () => {
    setStoredAccessToken(makeJwt({ sub: "1", email: "staff@example.com", role: "Admin" }));

    renderRoutes("/lenders");

    await waitFor(() => expect(screen.getByText("Protected")).toBeInTheDocument());
  });
});
