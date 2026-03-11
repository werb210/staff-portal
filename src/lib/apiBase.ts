const PROD_API_BASE_URL = "https://boreal-staff-server-e4hmaqbkb2g5hgfv.canadacentral-01.azurewebsites.net";
const DEV_API_BASE_URL = "http://localhost:3000";

const trimTrailingSlash = (value: string) => value.replace(/\/+$/, "");

const resolveApiBaseUrl = () => {
  const mode = import.meta.env.MODE;
  if (mode === "development" || mode === "test") {
    return DEV_API_BASE_URL;
  }
  return PROD_API_BASE_URL;
};

export const API_BASE_URL = trimTrailingSlash(resolveApiBaseUrl());

const isAbsoluteUrl = (path: string) => /^https?:\/\//i.test(path);

export const normalizeApiPath = (path: string) => {
  if (!path || isAbsoluteUrl(path) || !path.startsWith("/")) return path;
  if (path.startsWith("/api/")) return path;
  return `/api${path}`;
};

export const withApiBase = (path: string) => `${API_BASE_URL}${normalizeApiPath(path)}`;
