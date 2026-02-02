// @vitest-environment jsdom
import "@testing-library/jest-dom/vitest";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { createElement } from "react";
import { AuthProvider, useAuth } from "@/auth/AuthContext";
import { logout as logoutService } from "@/services/auth";

vi.mock("@/services/auth", () => ({
  startOtp: vi.fn(),
  verifyOtp: vi.fn(),
  logout: vi.fn()
}));

const TestLogoutAction = () => {
  const { logout } = useAuth();
  return createElement("button", { type: "button", onClick: () => logout() }, "Logout");
};

describe("logout cleanup", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(logoutService).mockResolvedValue(undefined);
  });

  it("clears storage and caches on logout", async () => {
    localStorage.setItem("test-key", "persist");
    sessionStorage.setItem("test-session", "persist");

    const cacheDelete = vi.fn();
    const cacheKeys = vi.fn(async () => ["cache-a", "cache-b"]);
    vi.stubGlobal("caches", {
      keys: cacheKeys,
      delete: cacheDelete
    });

    const postMessage = vi.fn();
    const unregister = vi.fn();
    const getRegistrations = vi.fn(async () => [{ unregister }]);
    Object.defineProperty(navigator, "serviceWorker", {
      value: { ready: Promise.resolve({ active: { postMessage } }), getRegistrations },
      configurable: true
    });

    render(
      <AuthProvider>
        <TestLogoutAction />
      </AuthProvider>
    );

    fireEvent.click(screen.getByRole("button", { name: "Logout" }));

    await waitFor(() => {
      expect(localStorage.getItem("test-key")).toBeNull();
      expect(sessionStorage.getItem("test-session")).toBeNull();
    });
    expect(cacheKeys).toHaveBeenCalled();
    expect(cacheDelete.mock.calls.length).toBeGreaterThanOrEqual(2);
    await waitFor(() => expect(postMessage).toHaveBeenCalledWith({ type: "CLEAR_CACHES" }));
    await waitFor(() => expect(getRegistrations).toHaveBeenCalled());
    await waitFor(() => expect(unregister).toHaveBeenCalled());
  });
});
