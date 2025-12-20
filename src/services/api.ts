const API_BASE =
  (window as any).__ENV__?.VITE_API_BASE_URL ||
  (window as any).__ENV__?.API_BASE_URL ||
  import.meta.env.VITE_API_BASE_URL ||
  import.meta.env.VITE_STAFF_SERVER_URL ||
  "";

function baseHasApiPrefix(base: string) {
  return base.replace(/\/+$/, "").endsWith("/api");
}

function normalizePath(path: string, base: string) {
  if (!path.startsWith("/")) path = `/${path}`;
  if (!baseHasApiPrefix(base) && !path.startsWith("/api/")) return `/api${path}`;
  return path;
}

function buildApiUrl(path: string) {
  const baseUrl = API_BASE ?? "";
  return `${baseUrl}${normalizePath(path, baseUrl)}`;
}

type ApiOptions = RequestInit & { skipAuth?: boolean };

let unauthorizedHandler: (() => void) | null = null;
let redirectingToLogin = false;

const redirectToLogin = () => {
  if (window.location.pathname !== "/login" && !redirectingToLogin) {
    redirectingToLogin = true;
    window.location.assign("/login");
  }
};

const handleUnauthorized = () => {
  localStorage.removeItem("accessToken");
  unauthorizedHandler?.();
  redirectToLogin();
};

export const setUnauthorizedHandler = (handler: (() => void) | null) => {
  unauthorizedHandler = handler;
};

export async function apiFetch<T = any>(path: string, options: ApiOptions = {}): Promise<T> {
  const token = localStorage.getItem("accessToken");
  const headers = new Headers(options.headers || undefined);
  const requiresAuth = !options.skipAuth;

  if (!headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  if (requiresAuth) {
    if (!token) {
      handleUnauthorized();
      throw new Error("Missing access token");
    }
    headers.set("Authorization", `Bearer ${token}`);
  }

  const response = await fetch(buildApiUrl(path), {
    ...options,
    headers,
  });

  if (response.status === 401 && requiresAuth) {
    handleUnauthorized();
    throw new Error("Unauthorized");
  }

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`API ${response.status}: ${text}`);
  }

  if (response.status === 204) {
    return null as T;
  }

  return response.json();
}

export { API_BASE, buildApiUrl };
