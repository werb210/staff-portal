// @vitest-environment jsdom
import "@testing-library/jest-dom/vitest";
import { afterEach, describe, expect, it, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { createElement } from "react";
import { AuthProvider, useAuth } from "@/auth/AuthContext";
import { clearStoredAuth, setStoredAccessToken } from "@/services/token";

type DeferredResponse = {
  promise: Promise<Response>;
  resolve: (value: Response) => void;
};

const createDeferredResponse = (): DeferredResponse => {
  let resolve: (value: Response) => void = () => undefined;
  const promise = new Promise<Response>((resolver) => {
    resolve = resolver;
  });
  return { promise, resolve };
};

const mockFetch = (response: Promise<Response>) => {
  vi.stubGlobal("fetch", vi.fn().mockReturnValue(response));
};

const AuthStatusProbe = () => {
  const { authStatus, rolesStatus } = useAuth();
  return createElement("span", { "data-testid": "status" }, `${authStatus}:${rolesStatus}`);
};

describe("auth contract", () => {
  afterEach(() => {
    clearStoredAuth();
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it("sets authenticated immediately and resolves roles after /api/auth/me", async () => {
    clearStoredAuth();
    setStoredAccessToken("token");

    const deferred = createDeferredResponse();
    mockFetch(deferred.promise);

    render(
      <AuthProvider>
        <AuthStatusProbe />
      </AuthProvider>
    );

    expect(screen.getByTestId("status")).toHaveTextContent("authenticated_pending:loading");

    deferred.resolve(
      new Response(JSON.stringify({ id: "1", role: "Staff" }), {
        status: 200,
        headers: { "content-type": "application/json" }
      })
    );

    await waitFor(() => {
      expect(screen.getByTestId("status")).toHaveTextContent("authenticated:resolved");
    });
  });
});
