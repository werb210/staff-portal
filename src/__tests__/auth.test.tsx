// @vitest-environment jsdom
import "@testing-library/jest-dom/vitest";
import { createElement } from "react";
import { render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { AuthProvider, useAuth } from "@/auth/AuthContext";
import { fetchCurrentUser } from "@/api/auth";

vi.mock("@/api/auth", () => ({
  fetchCurrentUser: vi.fn()
}));

const mockedFetchCurrentUser = vi.mocked(fetchCurrentUser);

const TestAuthState = () => {
  const { status, user } = useAuth();
  return createElement(
    "div",
    null,
    createElement("span", { "data-testid": "status" }, status),
    createElement("span", { "data-testid": "email" }, user?.email ?? "")
  );
};

const TestSetAuth = () => {
  const { setAuth } = useAuth();
  return createElement(
    "button",
    {
      type: "button",
      onClick: () =>
        setAuth({
          user: { id: "1", email: "demo@example.com", role: "Admin" }
        })
    },
    "Set Auth"
  );
};

describe("cookie auth", () => {
  it("stores user after OTP verification flow", async () => {
    render(
      <AuthProvider>
        <TestSetAuth />
        <TestAuthState />
      </AuthProvider>
    );

    screen.getByRole("button", { name: "Set Auth" }).click();

    await waitFor(() => expect(screen.getByTestId("status")).toHaveTextContent("authenticated"));
    expect(screen.getByTestId("email")).toHaveTextContent("demo@example.com");
  });

  it("hydrates auth state from /api/auth/me", async () => {
    mockedFetchCurrentUser.mockResolvedValueOnce({
      data: { id: "2", email: "restored@example.com", role: "Staff" }
    } as any);

    render(
      <AuthProvider>
        <TestAuthState />
      </AuthProvider>
    );

    await waitFor(() => expect(screen.getByTestId("status")).toHaveTextContent("authenticated"));
    expect(screen.getByTestId("email")).toHaveTextContent("restored@example.com");
  });
});
