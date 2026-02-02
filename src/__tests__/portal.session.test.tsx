// @vitest-environment jsdom
import "@testing-library/jest-dom/vitest";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { act, cleanup, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter, useLocation } from "react-router-dom";
import { reportAuthFailure } from "@/auth/authEvents";
import { resetPortalSessionGuard, usePortalSessionGuard } from "@/auth/portalSessionGuard";
import OfflineBanner from "@/components/OfflineBanner";

const clearAuthMock = vi.fn();

vi.mock("@/auth/AuthContext", () => ({
  useAuth: () => ({
    authStatus: "authenticated",
    clearAuth: clearAuthMock
  })
}));

const GuardHarness = () => {
  usePortalSessionGuard();
  const location = useLocation();
  return <div data-testid="path">{location.pathname}</div>;
};

describe("portal session guard and offline banner", () => {
  beforeEach(() => {
    resetPortalSessionGuard();
    clearAuthMock.mockClear();
  });

  afterEach(() => {
    cleanup();
  });

  it("redirects to login once on unauthorized responses", async () => {
    render(
      <MemoryRouter initialEntries={["/dashboard"]}>
        <GuardHarness />
      </MemoryRouter>
    );

    await act(async () => {
      reportAuthFailure("unauthorized");
    });

    await waitFor(() => {
      expect(screen.getByTestId("path").textContent).toBe("/login");
    });
    expect(clearAuthMock).toHaveBeenCalledTimes(1);
  });

  it("shows the offline banner when navigator is offline", () => {
    const originalOnLine = navigator.onLine;
    Object.defineProperty(navigator, "onLine", { value: false, configurable: true });

    render(<OfflineBanner />);

    expect(screen.getByRole("status")).toHaveTextContent("You’re offline");

    Object.defineProperty(navigator, "onLine", { value: originalOnLine, configurable: true });
  });
});
