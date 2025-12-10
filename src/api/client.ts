import { API_BASE_URL } from "@/utils/env";
import type { UserRole } from "@/utils/roles";

export type AuthTokens = {
  accessToken: string;
  refreshToken: string;
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

let getTokens: TokenProvider = () => null;
let updateTokens: TokenUpdater = () => undefined;
let triggerLogout: LogoutHandler = () => undefined;
let refreshInFlight: Promise<AuthTokens | null> | null = null;

const handleRefresh = async (): Promise<AuthTokens | null> => {
  const tokens = getTokens();
  if (!tokens?.refreshToken) return null;

  if (!refreshInFlight) {
    refreshInFlight = fetch(`${API_BASE_URL}/auth/refresh`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ refreshToken: tokens.refreshToken })
    })
      .then(async (response) => {
        if (!response.ok) return null;
        const body = (await response.json()) as { accessToken: string; refreshToken?: string };
        const nextTokens: AuthTokens = {
          accessToken: body.accessToken,
          refreshToken: body.refreshToken ?? tokens.refreshToken
        };
        updateTokens(nextTokens);
        return nextTokens;
      })
      .catch(() => null)
      .finally(() => {
        refreshInFlight = null;
      });
  }

  return refreshInFlight;
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

type RequestOptions = RequestInit & {
  skipAuth?: boolean;
};

const buildHeaders = (headers: HeadersInit = {}, includeAuth: boolean): HeadersInit => {
  const constructed = new Headers(headers);
  if (!constructed.has("Content-Type")) {
    constructed.set("Content-Type", "application/json");
  }
  if (includeAuth) {
    const token = getTokens()?.accessToken;
    if (token) {
      constructed.set("Authorization", `Bearer ${token}`);
    }
  }
  return constructed;
};

const toApiError = async (response: Response): Promise<ApiError> => {
  let details: unknown;
  try {
    details = await response.json();
  } catch (error) {
    details = undefined;
  }

  return {
    status: response.status,
    message: response.statusText || "Request failed",
    details
  };
};

const executeRequest = async <T>(path: string, options: RequestOptions = {}): Promise<T> => {
  const includeAuth = !options.skipAuth;
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: buildHeaders(options.headers, includeAuth)
  });

  if (response.ok) {
    if (response.status === 204) return undefined as T;
    const data = (await response.json()) as ApiResponse<T> | T;
    return (data as ApiResponse<T>).data ?? (data as T);
  }

  if (response.status === 401 && includeAuth) {
    const refreshed = await handleRefresh();
    if (refreshed?.accessToken) {
      const retryResponse = await fetch(`${API_BASE_URL}${path}`, {
        ...options,
        headers: buildHeaders(options.headers, true)
      });
      if (retryResponse.ok) {
        const retryData = (await retryResponse.json()) as ApiResponse<T> | T;
        return (retryData as ApiResponse<T>).data ?? (retryData as T);
      }
    }
    triggerLogout();
  }

  throw await toApiError(response);
};

export const apiClient = {
  get: <T>(path: string, options?: RequestOptions) =>
    executeRequest<T>(path, { ...options, method: "GET" }),
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
  delete: <T>(path: string, options?: RequestOptions) =>
    executeRequest<T>(path, { ...options, method: "DELETE" })
};

export type UserProfile = {
  id: string;
  name: string;
  email: string;
  role: UserRole;
};
