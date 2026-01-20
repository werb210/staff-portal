// @vitest-environment jsdom
import "@testing-library/jest-dom/vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import PrivateRoute from "@/router/PrivateRoute";
import { AuthProvider } from "@/auth/AuthContext";
import { fetchCurrentUser } from "@/api/auth";

vi.mock("@/api/auth", () => ({
  fetchCurrentUser: vi.fn()
}));

const mockedFetchCurrentUser = vi.mocked(fetchCurrentUser);

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
    mockedFetchCurrentUser.mockRejectedValueOnce(new Error("Unauthorized"));

    renderRoutes("/lenders");

    await waitFor(() => expect(screen.getByText("Login")).toBeInTheDocument());
  });

  it("allows authenticated users onto lender routes", async () => {
    mockedFetchCurrentUser.mockResolvedValueOnce({ data: { id: "1", role: "Admin" } } as any);

    renderRoutes("/lenders");

    await waitFor(() => expect(screen.getByText("Protected")).toBeInTheDocument());
  });
});
