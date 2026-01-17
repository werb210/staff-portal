// @vitest-environment jsdom
import "@testing-library/jest-dom/vitest";
import { createElement } from "react";
import { render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import apiClient from "@/api/client";
import { AuthProvider, useAuth } from "@/auth/AuthContext";
import { setStoredAccessToken } from "@/services/token";

const makeJwt = (payload: Record<string, unknown>) => {
  const encoded = btoa(JSON.stringify(payload))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
  return `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.${encoded}.signature`;
};

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
          token: makeJwt({ sub: "1", email: "demo@example.com", role: "Admin" }),
          user: { id: "1", email: "demo@example.com", role: "Admin" }
        })
    },
    "Set Auth"
  );
};

describe("JWT auth", () => {
  it("stores JWT after OTP verification flow", async () => {
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

  it("hydrates auth state from JWT without session calls", async () => {
    const apiGetSpy = vi.spyOn(apiClient, "get");
    setStoredAccessToken(makeJwt({ sub: "2", email: "restored@example.com", role: "Staff" }));

    render(
      <AuthProvider>
        <TestAuthState />
      </AuthProvider>
    );

    await waitFor(() => expect(screen.getByTestId("status")).toHaveTextContent("authenticated"));
    expect(screen.getByTestId("email")).toHaveTextContent("restored@example.com");
    expect(apiGetSpy).not.toHaveBeenCalledWith("/api/auth/session", expect.anything());
  });
});
