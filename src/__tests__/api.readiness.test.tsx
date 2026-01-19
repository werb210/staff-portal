// @vitest-environment jsdom

import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import { cleanup, render, screen, waitFor } from "@testing-library/react";
import apiClient from "@/api/httpClient";
import { ApiError } from "@/api/http";
import { useApiHealthCheck } from "@/hooks/useApiHealthCheck";
import ApiStatusBanner from "@/components/layout/ApiStatusBanner";
import { useApiStatusStore } from "@/state/apiStatus";

const TestShell = () => {
  useApiHealthCheck();
  const status = useApiStatusStore((state) => state.status);

  return (
    <div>
      <ApiStatusBanner />
      <div data-testid="app-content">Portal content</div>
      <div data-testid="api-status">{status}</div>
    </div>
  );
};

describe("API readiness handling", () => {
  beforeEach(() => {
    useApiStatusStore.setState({ status: "starting" });
  });

  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  it("marks the app available when /health succeeds", async () => {
    vi.spyOn(apiClient, "get").mockResolvedValueOnce({});

    render(<TestShell />);

    await waitFor(() => {
      expect(screen.getByTestId("api-status").textContent).toBe("available");
    });

    expect(apiClient.get).toHaveBeenCalledWith("/health", { skipAuth: true });
  });

  it("does not call /_int/ready and still renders the UI", async () => {
    vi.spyOn(apiClient, "get").mockImplementation(async (path: string) => {
      if (path === "/_int/ready") {
        throw new Error("Should not call /_int/ready");
      }
      return {};
    });

    render(<TestShell />);

    await waitFor(() => {
      expect(screen.getByTestId("api-status").textContent).toBe("available");
    });

    expect(screen.getByTestId("app-content")).not.toBeNull();
    expect(apiClient.get).toHaveBeenCalledWith("/health", { skipAuth: true });
  });

  it("shows a banner on 503 while still rendering the app", async () => {
    vi.spyOn(apiClient, "get").mockRejectedValueOnce(
      new ApiError({ status: 503, message: "Service Unavailable" })
    );

    render(<TestShell />);

    await waitFor(() => {
      expect(screen.getByTestId("api-status").textContent).toBe("unavailable");
    });

    expect(screen.getByTestId("app-content")).not.toBeNull();
    expect(screen.getByRole("status").textContent).toContain("Server unavailable");
  });
});
