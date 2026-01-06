import { getApiBaseUrl } from "@/config/runtime";

function baseHasApiPrefix(base: string) {
  return base.replace(/\/+$/, "").endsWith("/api");
}

function normalizePath(path: string, base: string) {
  if (!path.startsWith("/")) path = `/${path}`;
  if (!baseHasApiPrefix(base) && !path.startsWith("/api/")) return `/api${path}`;
  return path;
}

function buildApiUrl(path: string) {
  const baseUrl = getApiBaseUrl();
  return `${baseUrl}${normalizePath(path, baseUrl)}`;
}

export const redirectToLogin = () => {
  if (window.location.pathname !== "/login") {
    window.location.assign("/login");
  }
};

const getApiBaseUrlValue = () => getApiBaseUrl();

export { buildApiUrl, getApiBaseUrlValue as API_BASE };
