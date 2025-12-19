/****************************************************************************************
 * BLOCK 2 — Staff-Portal (FRONTEND)
 *
 * REPO: werb210/staff-portal
 * FILE: src/api/client.ts
 * ACTION: REPLACE ENTIRE FILE
 *
 * CONTRACT (DO NOT VIOLATE):
 * - BASE URL MUST NOT INCLUDE /api
 * - SERVER ROUTES ALREADY START WITH /api
 * - THIS CLIENT MUST:
 *     • auto-prefix /api when needed
 *     • NEVER double-prefix /api
 *     • ALWAYS attach Authorization header if token exists
 *
 * EXPECTED BEHAVIOR:
 * - /api/health        → 200 OK (no auth)
 * - /api/applications → 401 if no token (CORRECT)
 ****************************************************************************************/

import axios, { AxiosRequestConfig } from "axios";

const API_ORIGIN = "https://server.boreal.financial";

export const apiClient = axios.create({
  baseURL: API_ORIGIN,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

// Normalize URLs to avoid /api duplication
function normalizePath(url: string): string {
  // Absolute URL — leave untouched
  if (/^https?:\/\//i.test(url)) return url;

  const path = url.startsWith("/") ? url : `/${url}`;

  // Already internal or already /api
  if (path.startsWith("/_int") || path.startsWith("/api")) {
    return path;
  }

  // Default: prefix with /api
  return `/api${path}`;
}

// Attach token + normalize path
apiClient.interceptors.request.use((config: AxiosRequestConfig) => {
  if (config.url) {
    config.url = normalizePath(config.url);
  }

  const token =
    localStorage.getItem("access_token") ||
    localStorage.getItem("auth_token") ||
    localStorage.getItem("token");

  if (token) {
    config.headers = config.headers ?? {};
    if (!("Authorization" in config.headers)) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }

  return config;
});

export default apiClient;
