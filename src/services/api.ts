import { RUNTIME_ENV } from "@/config/runtime";

const API_BASE = RUNTIME_ENV.API_BASE_URL;

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

export const redirectToLogin = () => {
  if (window.location.pathname !== "/login") {
    window.location.assign("/login");
  }
};

export { API_BASE, buildApiUrl };
