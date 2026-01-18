import { getApiBaseUrl } from "@/config/api";

function normalizePath(path: string) {
  if (!path.startsWith("/")) path = `/${path}`;
  if (path === "/health") return path;
  const trimmed = path.startsWith("/api/") ? path.replace(/^\/api/, "") : path;
  return `/api${trimmed}`;
}

function buildApiUrl(path: string) {
  const baseUrl = getApiBaseUrl();
  const normalizedPath = normalizePath(path);
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
