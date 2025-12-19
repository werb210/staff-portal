/* ============================================================
   FILE: src/utils/api.ts
   PURPOSE: Centralized API utilities + health check export
   ============================================================ */

const API_BASE_URL =
  (window as any).__ENV__?.VITE_API_BASE_URL ||
  (window as any).__ENV__?.API_BASE_URL ||
  import.meta.env.VITE_API_BASE_URL ||
  import.meta.env.VITE_STAFF_SERVER_URL;

const baseHasApiPrefix = API_BASE_URL?.replace(/\/+$/, "").endsWith("/api") ?? false;

function normalizePath(path: string) {
  if (!path.startsWith("/")) path = `/${path}`;
  if (!baseHasApiPrefix && !path.startsWith("/api/")) return `/api${path}`;
  return path;
}

export async function apiFetch<T = any>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const baseUrl = API_BASE_URL ?? "";
  const url = `${baseUrl}${normalizePath(path)}`;

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

/* ============================================================
   REQUIRED LEGACY EXPORT — DO NOT REMOVE
   Used by src/App.tsx
   ============================================================ */
export async function checkStaffServerHealth(): Promise<boolean> {
  try {
    await apiFetch("/_int/health");
    return true;
  } catch {
    return false;
  }
}
