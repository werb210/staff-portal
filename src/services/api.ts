import { getApiBaseUrl } from "@/config/api";

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

function buildApiUrl(path: string) {
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
  const isTestEnv = typeof process !== "undefined" && process.env?.NODE_ENV === "test";
  if (isTestEnv) {
    window.history.pushState({}, "", path);
    window.dispatchEvent(new PopStateEvent("popstate"));
    return;
  }
  try {
    window.location.assign(path);
  } catch (error) {
    window.history.pushState({}, "", path);
    window.dispatchEvent(new PopStateEvent("popstate"));
  }
};

export const redirectToLogin = () => {
  navigateTo("/login");
};

export const redirectToDashboard = () => {
  navigateTo("/dashboard");
};

const getApiBaseUrlValue = () => getApiBaseUrl();

export { buildApiUrl, getApiBaseUrlValue as API_BASE };
