import { API_BASE_URL } from "./env";

const getApiBaseUrl = () => {
  const baseUrl = API_BASE_URL?.replace(/\/+$/, "");

  if (!baseUrl) {
    throw new Error("VITE_API_BASE_URL is not defined. Unable to contact Staff Server.");
  }

  return baseUrl;
};

const toAbsoluteUrl = (path: string) => {
  const normalizedBase = getApiBaseUrl();
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;

  return `${normalizedBase}${normalizedPath}`;
};

export const apiFetch = (path: string, options?: RequestInit) => fetch(toAbsoluteUrl(path), options);

export const checkStaffServerHealth = async () => {
  const response = await apiFetch("/api/_int/health", { method: "GET" });

  if (!response.ok) {
    throw new Error(`Health check failed with status ${response.status}`);
  }

  return response;
};
