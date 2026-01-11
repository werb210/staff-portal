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

export const redirectToLogin = () => {
  if (window.location.pathname !== "/login") {
    window.location.assign("/login");
  }
};

const getApiBaseUrlValue = () => getApiBaseUrl();

export { buildApiUrl, getApiBaseUrlValue as API_BASE };
