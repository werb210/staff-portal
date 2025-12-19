/* =========================================================
   FILE: src/utils/api.ts
   PURPOSE: Single source of truth for API routing
   ========================================================= */

const BASE_URL =
  (window as any).__ENV__?.VITE_API_BASE_URL ||
  import.meta.env.VITE_API_BASE_URL;

if (!BASE_URL) {
  throw new Error("VITE_API_BASE_URL is not defined");
}

function normalizePath(path: string) {
  if (!path.startsWith("/")) path = `/${path}`;
  if (!path.startsWith("/api/")) path = `/api${path}`;
  return path;
}

export async function apiFetch<T = any>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${BASE_URL}${normalizePath(path)}`;

  const res = await fetch(url, {
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
    ...options,
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`API ${res.status}: ${text}`);
  }

  return res.json();
}
