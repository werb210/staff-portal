import { RUNTIME_ENV } from "@/config/runtime";
import type { UserRole } from "@/utils/roles";

export type AuthTokens = {
  token: string;
};

export type ApiError = {
  status: number;
  message: string;
  details?: unknown;
};

export type ApiResponse<T> = {
  data: T;
};

type TokenProvider = () => AuthTokens | null;
type TokenUpdater = (tokens: AuthTokens | null) => void;
type LogoutHandler = () => void;

type RequestOptions = RequestInit & {
  skipAuth?: boolean;
};

let getTokens: TokenProvider = () => null;
let updateTokens: TokenUpdater = () => undefined;
let triggerLogout: LogoutHandler = () => undefined;

const toAbsoluteUrl = (path: string) => {
  const normalizedBase = RUNTIME_ENV.API_BASE_URL.replace(/\/+$/, "");
  const cleanedPath = path.startsWith("/api") ? path.replace(/^\/api/, "") : path;
  const normalizedPath = cleanedPath.startsWith("/") ? cleanedPath : `/${cleanedPath}`;

  return `${normalizedBase}${normalizedPath}`;
};

export const configureApiClient = (options: {
  tokenProvider: TokenProvider;
  onTokensUpdated: TokenUpdater;
  onUnauthorized: LogoutHandler;
}) => {
  getTokens = options.tokenProvider;
  updateTokens = options.onTokensUpdated;
  triggerLogout = options.onUnauthorized;
};

const buildHeaders = (headers: HeadersInit = {}, includeAuth: boolean): HeadersInit => {
  const constructed = new Headers(headers);
  if (!constructed.has("Content-Type")) {
    constructed.set("Content-Type", "application/json");
  }
  if (includeAuth) {
    const token = getTokens()?.token;
    if (token) {
      constructed.set("Authorization", `Bearer ${token}`);
    }
  }
  return constructed;
};

const toApiError = async (response: Response): Promise<ApiError> => {
  let details: unknown;
  try {
    details = await response.clone().json();
  } catch (error) {
    try {
      details = await response.clone().text();
    } catch (fallbackError) {
      details = (fallbackError as Error)?.message;
    }
  }

  return {
    status: response.status,
    message: response.statusText || "Request failed",
    details
  };
};

const executeRequest = async <T>(path: string, options: RequestOptions = {}): Promise<T> => {
  const includeAuth = !options.skipAuth;
  const url = toAbsoluteUrl(path);
  const response = await fetch(url, {
    ...options,
    headers: buildHeaders(options.headers, includeAuth)
  });

  if (response.ok) {
    if (response.status === 204) return undefined as T;
    const data = (await response.json()) as ApiResponse<T> | T;
    return (data as ApiResponse<T>).data ?? (data as T);
  }

  if (response.status === 401 && includeAuth) {
    triggerLogout();
  }

  throw await toApiError(response);
};

export const apiClient = {
  get: <T>(path: string, options?: RequestOptions) => executeRequest<T>(path, { ...options, method: "GET" }),
  post: <T>(path: string, body?: unknown, options?: RequestOptions) =>
    executeRequest<T>(path, {
      ...options,
      method: "POST",
      body: body ? JSON.stringify(body) : undefined
    }),
  put: <T>(path: string, body?: unknown, options?: RequestOptions) =>
    executeRequest<T>(path, {
      ...options,
      method: "PUT",
      body: body ? JSON.stringify(body) : undefined
    }),
  patch: <T>(path: string, body?: unknown, options?: RequestOptions) =>
    executeRequest<T>(path, {
      ...options,
      method: "PATCH",
      body: body ? JSON.stringify(body) : undefined
    }),
  delete: <T>(path: string, options?: RequestOptions) => executeRequest<T>(path, { ...options, method: "DELETE" })
};

export type UserProfile = {
  id: string;
  name: string;
  email: string;
  role: UserRole;
};
