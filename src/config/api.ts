/*
 * Centralised API base URL configuration.
 */
export const getApiBaseUrl = (): string => {
  if (typeof window !== "undefined" && (window as any).__ENV__) {
    const env = (window as any).__ENV__;
    if (typeof env.VITE_API_BASE_URL === "string" && env.VITE_API_BASE_URL.trim()) {
      return env.VITE_API_BASE_URL;
    }
    if (typeof env.API_BASE_URL === "string" && env.API_BASE_URL.trim()) {
      return env.API_BASE_URL;
    }
  }

  if (typeof import.meta !== "undefined" && import.meta.env) {
    const metaEnv = import.meta.env as any;
    if (typeof metaEnv.VITE_API_BASE_URL === "string" && metaEnv.VITE_API_BASE_URL.trim()) {
      return metaEnv.VITE_API_BASE_URL;
    }
    if (typeof metaEnv.VITE_API_URL === "string" && metaEnv.VITE_API_URL.trim()) {
      return metaEnv.VITE_API_URL;
    }
  }

  return "";
};

function baseHasApiPrefix(base: string) {
  return base.replace(/\/+$/, "").endsWith("/api");
}

function stripApiSuffix(base: string) {
  return base.replace(/\/api\/?$/, "");
}

function normalizePath(path: string, base: string) {
  if (!path.startsWith("/")) path = `/${path}`;
  if (path === "/health") return "/health";
  if (!baseHasApiPrefix(base) && !path.startsWith("/api/")) return `/api${path}`;
  return path;
}

export function buildApiUrl(path: string): string {
  const baseUrl = getApiBaseUrl();
  const normalizedPath = normalizePath(path, baseUrl);
  if (normalizedPath === "/health") {
    return `${stripApiSuffix(baseUrl)}${normalizedPath}`;
  }
  return `${baseUrl}${normalizedPath}`;
}

const navigateTo = (path: string) => {
  if (typeof window === "undefined") return;
  if (window.location.pathname === path) return;
  try {
    window.location.assign(path);
  } catch {
    window.history.pushState({}, "", path);
    window.dispatchEvent(new PopStateEvent("popstate"));
  }
};

export const redirectToLogin = () => navigateTo("/login");
export const redirectToDashboard = () => navigateTo("/dashboard");
export const API_BASE = () => getApiBaseUrl();
