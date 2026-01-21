// @vitest-environment jsdom
import "@testing-library/jest-dom/vitest";
import { describe, expect, it, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { createElement } from "react";
import { AuthProvider, useAuth } from "@/auth/AuthContext";
import { fetchCurrentUser } from "@/api/auth";
import { clearStoredAuth, setStoredAccessToken } from "@/services/token";

vi.mock("@/api/auth", () => ({
  fetchCurrentUser: vi.fn()
}));

const mockedFetchCurrentUser = vi.mocked(fetchCurrentUser);

const AuthStatusProbe = () => {
  const { authStatus, rolesStatus } = useAuth();
  return createElement("span", { "data-testid": "status" }, `${authStatus}:${rolesStatus}`);
};

describe("auth contract", () => {
  it("sets authenticated immediately and resolves roles after /api/auth/me", async () => {
    clearStoredAuth();
    setStoredAccessToken("token");

    let resolveUser: ((value: { data: { id: string; role: string } }) => void) | undefined;
    const pendingUser = new Promise<{ data: { id: string; role: string } }>((resolve) => {
      resolveUser = resolve;
    });
    mockedFetchCurrentUser.mockReturnValue(pendingUser as any);

    render(
      <AuthProvider>
        <AuthStatusProbe />
      </AuthProvider>
    );

    expect(screen.getByTestId("status")).toHaveTextContent("authenticated:loading");

    resolveUser?.({ data: { id: "1", role: "Staff" } });

    await waitFor(() => {
      expect(screen.getByTestId("status")).toHaveTextContent("authenticated:resolved");
    });
  });
});
