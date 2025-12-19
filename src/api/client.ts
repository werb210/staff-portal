import axios, { AxiosRequestConfig, AxiosResponse } from "axios";

/**
 * Staff-Portal API client
 *
 * Goals:
 *  - Base URL must NOT include /api (server routes already start with /api)
 *  - Auto-prefix /api for relative paths (but never double-prefix)
 *  - ALWAYS attach Authorization: Bearer <token> when a token exists
 *  - Keep withCredentials=true for any cookie-based flows
 */

const API_ORIGIN = "https://server.boreal.financial";

/** Normalize a request path so we never hit /api/api/... */
function normalizePath(input?: string): string | undefined {
  if (!input) return input;

  // Absolute URL? leave it alone.
  if (/^https?:\/\//i.test(input)) return input;

  // Ensure leading slash
  const path = input.startsWith("/") ? input : `/${input}`;

  // Allow internal /_int/* routes if you ever call them
  if (path.startsWith("/_int/")) return path;

  // Already /api or /api/... keep it
  if (path === "/api" || path.startsWith("/api/")) return path;

  // Everything else becomes /api/<path>
  return `/api${path}`;
}

/** Read a cookie value by name */
function getCookie(name: string): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : null;
}

/** Try very hard to find whatever token your login stored */
function getAuthToken(): string | null {
  if (typeof window === "undefined") return null;

  const keys = [
    "access_token",
    "auth_token",
    "token",
    "jwt",
    "bf_token",
    "staff_token",
    "id_token",
  ];

  // localStorage / sessionStorage
  for (const k of keys) {
    const v =
      window.localStorage.getItem(k) ||
      window.sessionStorage.getItem(k);

    if (v && v.trim()) return v.trim();
  }

  // cookies
  for (const k of keys) {
    const v = getCookie(k);
    if (v && v.trim()) return v.trim();
  }

  // Nothing found
  return null;
}

function cleanBearer(token: string): string {
  return token.replace(/^Bearer\s+/i, "").trim();
}

export const apiClient = axios.create({
  baseURL: API_ORIGIN, // IMPORTANT: no /api here
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor: normalize URL + attach token
apiClient.interceptors.request.use((config: AxiosRequestConfig) => {
  // Normalize URL/path
  if (typeof config.url === "string") {
    config.url = normalizePath(config.url);
  }

  // Ensure headers object exists
  config.headers = config.headers ?? {};

  // If Authorization already set explicitly, do not override
  const headersAny = config.headers as Record<string, any>;
  const existingAuth =
    headersAny.Authorization ||
    headersAny.authorization;

  if (!existingAuth) {
    const token = getAuthToken();
    if (token) {
      headersAny.Authorization = `Bearer ${cleanBearer(token)}`;
    }
  }

  return config;
});

// Optional: helpful for debugging 401 loops
apiClient.interceptors.response.use(
  (res: AxiosResponse) => res,
  (err) => {
    // Keep errors as-is; UI decides what to do.
    return Promise.reject(err);
  }
);

export default apiClient;
