import { beforeEach, describe, expect, it, vi } from "vitest";

type ApiModule = typeof import("./api");

type FetchArgs = [RequestInfo | URL, RequestInit?];

const createFetchMock = (json: unknown, init: ResponseInit = { status: 200 }) =>
  vi.fn((..._args: FetchArgs) => Promise.resolve(new Response(JSON.stringify(json), init)));

async function importApiModule(): Promise<ApiModule> {
  vi.resetModules();
  return import("./api");
}

describe("apiFetch", () => {
  beforeEach(() => {
    localStorage.clear();
    delete (globalThis as Partial<typeof globalThis>).fetch;
    delete (window as Window & { __ENV__?: unknown }).__ENV__;
  });

  it("attaches Authorization header when an access token exists", async () => {
    localStorage.setItem("accessToken", "token-123");
    const fetchMock = createFetchMock({ ok: true });
    globalThis.fetch = fetchMock as unknown as typeof fetch;

    const { apiFetch } = await importApiModule();

    await apiFetch("/applications");

    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [, init] = fetchMock.mock.calls[0]!;
    const headers = new Headers(init?.headers as HeadersInit);

    expect(headers.get("Authorization")).toBe("Bearer token-123");
    expect(headers.get("Content-Type")).toBe("application/json");
  });

  it("throws before sending a request when the token is missing", async () => {
    const fetchMock = createFetchMock({ ok: true });
    globalThis.fetch = fetchMock as unknown as typeof fetch;
    const assignMock = vi.fn();
    const originalLocation = window.location;
    Object.defineProperty(window, "location", {
      configurable: true,
      value: { assign: assignMock }
    });

    const { apiFetch } = await importApiModule();

    await expect(apiFetch("/applications")).rejects.toThrow("Missing access token");
    expect(fetchMock).not.toHaveBeenCalled();
    Object.defineProperty(window, "location", {
      configurable: true,
      value: originalLocation
    });
  });

  it("clears the token and redirects on 401 responses", async () => {
    localStorage.setItem("accessToken", "expired");
    const assignMock = vi.fn();
    const originalLocation = window.location;
    Object.defineProperty(window, "location", {
      configurable: true,
      value: { assign: assignMock }
    });

    const fetchMock = vi.fn(async () => new Response("unauthorized", { status: 401 }));
    globalThis.fetch = fetchMock as unknown as typeof fetch;

    const { apiFetch } = await importApiModule();

    await expect(apiFetch("/secure"))
      .rejects.toThrow("Unauthorized");

    expect(localStorage.getItem("accessToken")).toBeNull();
    expect(assignMock).toHaveBeenCalledWith("/login");
    Object.defineProperty(window, "location", {
      configurable: true,
      value: originalLocation
    });
  });

  it("allows unauthenticated requests when skipAuth is true", async () => {
    const fetchMock = createFetchMock({ ok: true });
    globalThis.fetch = fetchMock as unknown as typeof fetch;

    const { apiFetch } = await importApiModule();

    await apiFetch("/_int/health", { skipAuth: true });

    expect(fetchMock).toHaveBeenCalled();
    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [, init] = fetchMock.mock.calls[0]!;
    const headers = new Headers(init?.headers as HeadersInit);
    expect(headers.get("Authorization")).toBeNull();
  });

  it("prefixes /api and uses the configured base URL", async () => {
    (window as Window & { __ENV__?: { VITE_API_URL?: string } }).__ENV__ = {
      VITE_API_URL: "https://server.boreal.financial"
    };
    const fetchMock = createFetchMock({ ok: true });
    globalThis.fetch = fetchMock as unknown as typeof fetch;

    const { apiFetch } = await importApiModule();

    await apiFetch("/example", { skipAuth: true });

    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [url] = fetchMock.mock.calls[0]!;
    expect(url).toBe("https://server.boreal.financial/api/example");
  });

  it("returns parsed JSON responses", async () => {
    const payload = { message: "hello" };
    const fetchMock = createFetchMock(payload);
    globalThis.fetch = fetchMock as unknown as typeof fetch;

    const { apiFetch } = await importApiModule();

    const data = await apiFetch("/data", { skipAuth: true });
    expect(data).toEqual(payload);
  });
});
