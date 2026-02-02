import { useEffect } from "react";
import { render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { AuthProvider, useAuth } from "@/auth/AuthContext";

vi.mock("@/utils/sessionStore", async () => ({
  readSession: vi.fn(async () => ({
    accessToken: "resume-token",
    user: { id: "user-1", name: "Resume User", email: "resume@example.com", role: "Staff" }
  })),
  writeSession: vi.fn(async () => undefined),
  clearSession: vi.fn(async () => undefined)
}));

const StatusProbe = () => {
  const { authStatus, user } = useAuth();
  useEffect(() => {}, [authStatus, user]);
  return (
    <div>
      <span data-testid="auth-status">{authStatus}</span>
      <span data-testid="auth-user">{user?.name ?? "none"}</span>
    </div>
  );
};

describe("AuthProvider session resume", () => {
  it("hydrates auth state from stored session", async () => {
    render(
      <AuthProvider>
        <StatusProbe />
      </AuthProvider>
    );

    await waitFor(() => expect(screen.getByTestId("auth-status")).toHaveTextContent("authenticated"));
    expect(screen.getByTestId("auth-user")).toHaveTextContent("Resume User");
  });
});
