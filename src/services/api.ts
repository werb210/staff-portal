export type RuntimeEnv = {
  VITE_API_BASE_URL?: string;
};

function getRuntimeEnv(): RuntimeEnv | undefined {
  const w = window as any;
  return w && w.__ENV__ ? (w.__ENV__ as RuntimeEnv) : undefined;
}

function normalizeBaseUrl(raw: string): string {
  let base = raw.trim();
  base = base.replace(/\/+$/, "");
  return base;
}

function ensureApiPrefix(base: string): string {
  if (base.toLowerCase().endsWith("/api")) return base;
  return `${base}/api`;
}

const fromVite = (import.meta as any).env?.VITE_API_BASE_URL as string | undefined;
const fromRuntime = getRuntimeEnv()?.VITE_API_BASE_URL;

const BASE = normalizeBaseUrl(fromRuntime || fromVite || "https://server.boreal.financial");
export const API_BASE = ensureApiPrefix(BASE);

export async function apiFetch(path: string, options: RequestInit = {}) {
  const p = path.startsWith("/") ? path : `/${path}`;
  return fetch(`${API_BASE}${p}`, {
    ...options,
    credentials: "include",
    headers: {
      ...(options.headers || {}),
      "Content-Type": "application/json",
    },
  });
}
