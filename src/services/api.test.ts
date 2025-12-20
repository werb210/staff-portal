import { beforeEach, describe, expect, it, vi } from "vitest";

type ApiModule = typeof import("./api");

function createFetchMock(json: any, init: ResponseInit = { status: 200 }) {
  return vi.fn(async () => new Response(JSON.stringify(json), init));
}

async function importApiModule(): Promise<ApiModule> {
  vi.resetModules();
  return import("./api");
}

describe("apiFetch", () => {
  beforeEach(() => {
    localStorage.clear();
    // @ts-expect-error allow overriding for tests
    delete (global as any).fetch;
    // @ts-expect-error allow overriding for tests
    delete (window as any).__ENV__;
  });

  it("attaches Authorization header when an access token exists", async () => {
    localStorage.setItem("accessToken", "token-123");
    const fetchMock = createFetchMock({ ok: true });
    // @ts-expect-error test override
    global.fetch = fetchMock;

    const { apiFetch } = await importApiModule();

    await apiFetch("/applications");

    const [, init] = fetchMock.mock.calls[0];
    const headers = new Headers(init?.headers as HeadersInit);

    expect(headers.get("Authorization")).toBe("Bearer token-123");
    expect(headers.get("Content-Type")).toBe("application/json");
  });

  it("clears the token and redirects on 401 responses", async () => {
    localStorage.setItem("accessToken", "expired");
    const assignMock = vi.fn();
    // @ts-expect-error test override
    delete window.location;
    // @ts-expect-error test override
    window.location = { assign: assignMock };

    const fetchMock = vi.fn(async () => new Response("unauthorized", { status: 401 }));
    // @ts-expect-error test override
    global.fetch = fetchMock;

    const { apiFetch } = await importApiModule();

    await expect(apiFetch("/secure"))
      .rejects.toThrow("Unauthorized");

    expect(localStorage.getItem("accessToken")).toBeNull();
    expect(assignMock).toHaveBeenCalledWith("/login");
  });

  it("prefixes /api and uses the configured base URL", async () => {
    // @ts-expect-error configure test env
    (window as any).__ENV__ = { VITE_API_BASE_URL: "https://server.boreal.financial" };
    const fetchMock = createFetchMock({ ok: true });
    // @ts-expect-error test override
    global.fetch = fetchMock;

    const { apiFetch } = await importApiModule();

    await apiFetch("/example");

    const [url] = fetchMock.mock.calls[0];
    expect(url).toBe("https://server.boreal.financial/api/example");
  });

  it("returns parsed JSON responses", async () => {
    const payload = { message: "hello" };
    const fetchMock = createFetchMock(payload);
    // @ts-expect-error test override
    global.fetch = fetchMock;

    const { apiFetch } = await importApiModule();

    const data = await apiFetch("/data");
    expect(data).toEqual(payload);
  });
});
