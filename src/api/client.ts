import axios, { AxiosRequestConfig } from "axios";

const API_ORIGIN = "https://server.boreal.financial";

export const apiClient = axios.create({
  baseURL: API_ORIGIN,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

function normalizeUrl(url: string): string {
  // If someone passes full URL, leave it alone
  if (/^https?:\/\//i.test(url)) return url;

  // Ensure leading slash for consistent handling
  const u = url.startsWith("/") ? url : `/${url}`;

  // Allow internal routes if you use them
  if (u.startsWith("/_int/")) return u;

  // If already /api/... keep it
  if (u === "/api" || u.startsWith("/api/")) return u;

  // Anything else gets /api prefixed
  return `/api${u}`;
}

apiClient.interceptors.request.use((config: AxiosRequestConfig) => {
  // Normalize path to avoid /health -> /api/health, /applications -> /api/applications, etc.
  if (typeof config.url === "string") {
    config.url = normalizeUrl(config.url);
  }

  // Attach token if present and header not already set
  const token =
    localStorage.getItem("access_token") ||
    localStorage.getItem("auth_token") ||
    localStorage.getItem("token");

  if (token) {
    config.headers = (config.headers ?? {}) as any;
    const headersAny = config.headers as any;
    if (!headersAny.Authorization && !headersAny.authorization) {
      headersAny.Authorization = `Bearer ${token}`;
    }
  }

  return config;
});

export default apiClient;
