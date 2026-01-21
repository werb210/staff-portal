// @vitest-environment jsdom
import "@testing-library/jest-dom/vitest";
import { afterEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import App from "@/App";
import { clearStoredAuth, setStoredAccessToken } from "@/services/token";

type MockAuthMePayload = {
  ok: boolean;
  role: string | null;
};

const mockAuthMe = ({ ok, role }: MockAuthMePayload) => {
  let resolve: (value: Response) => void = () => undefined;
  const pending = new Promise<Response>((resolver) => {
    resolve = resolver;
  });
  const response = ok
    ? new Response(JSON.stringify({ id: "u1", role }), {
        status: 200,
        headers: { "content-type": "application/json" }
      })
    : new Response(null, { status: 401 });

  vi.stubGlobal(
    "fetch",
    vi.fn().mockImplementation((input) => {
      if (String(input).includes("/api/auth/me")) {
        return pending;
      }
      return Promise.resolve(response);
    })
  );

  return { resolve: () => resolve(response) };
};

describe("auth hydration stability", () => {
  afterEach(() => {
    clearStoredAuth();
    vi.unstubAllGlobals();
  });

  it("does not redirect or blank screen during auth hydration", async () => {
    setStoredAccessToken("test-token");
    mockAuthMe({ ok: true, role: null });

    render(<App />);

    expect(screen.getByText(/loading/i)).toBeInTheDocument();
  });
});
