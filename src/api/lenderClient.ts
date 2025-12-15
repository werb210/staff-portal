import { API_BASE_URL } from "@/utils/env";

export type LenderAuthTokens = {
  refreshToken: string;
  accessToken: string;
};

export type LenderApiError = {
  status: number;
  message: string;
  details?: unknown;
};

type TokenProvider = () => LenderAuthTokens | null;
type TokenUpdater = (tokens: LenderAuthTokens | null) => void;
type LogoutHandler = () => void;

type RequestOptions = RequestInit & {
  skipAuth?: boolean;
};

let getTokens: TokenProvider = () => null;
let onTokensUpdated: TokenUpdater = () => undefined;
let onUnauthorized: LogoutHandler = () => undefined;
let refreshInFlight: Promise<LenderAuthTokens | null> | null = null;

const toAbsoluteUrl = (path: string) => {
  const normalizedBase = API_BASE_URL.replace(/\/+$/, "");
  const cleanedPath = path.startsWith("/api") ? path.replace(/^\/api/, "") : path;
  const normalizedPath = cleanedPath.startsWith("/") ? cleanedPath : `/${cleanedPath}`;

  return `${normalizedBase}${normalizedPath}`;
};

const buildHeaders = (headers: HeadersInit = {}, includeAuth: boolean, body?: BodyInit): HeadersInit => {
  const constructed = new Headers(headers);
  if (!constructed.has("Content-Type") && !(body instanceof FormData)) {
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

const toApiError = async (response: Response): Promise<LenderApiError> => {
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
  return { status: response.status, message: response.statusText || "Request failed", details };
};

const handleRefresh = async (): Promise<LenderAuthTokens | null> => {
  const tokens = getTokens();
  if (!tokens?.refreshToken) return null;

  if (!refreshInFlight) {
    refreshInFlight = fetch(toAbsoluteUrl(`/lender/auth/refresh`), {
      method: "POST",
      headers: buildHeaders({}, false),
      body: JSON.stringify({ refreshToken: tokens.refreshToken })
    })
      .then(async (response) => {
        if (!response.ok) return null;
        const body = (await response.json()) as { accessToken: string; refreshToken?: string };
        const nextTokens: LenderAuthTokens = {
          accessToken: body.accessToken,
          refreshToken: body.refreshToken ?? tokens.refreshToken
        };
        onTokensUpdated(nextTokens);
        return nextTokens;
      })
      .catch(() => null)
      .finally(() => {
        refreshInFlight = null;
      });
  }

  return refreshInFlight;
};

export const configureLenderApiClient = (options: {
  tokenProvider: TokenProvider;
  onTokensUpdated: TokenUpdater;
  onUnauthorized: LogoutHandler;
}) => {
  getTokens = options.tokenProvider;
  onTokensUpdated = options.onTokensUpdated;
  onUnauthorized = options.onUnauthorized;
};

const executeRequest = async <T>(path: string, options: RequestOptions = {}): Promise<T> => {
  const includeAuth = !options.skipAuth;
  const response = await fetch(toAbsoluteUrl(path), {
    ...options,
    headers: buildHeaders(options.headers, includeAuth, options.body ?? undefined)
  });

  if (response.ok) {
    if (response.status === 204) return undefined as T;
    const data = (await response.json()) as { data?: T } | T;
    return (data as { data?: T }).data ?? (data as T);
  }

  if (response.status === 401 && includeAuth) {
    const refreshed = await handleRefresh();
    if (refreshed?.accessToken) {
      const retry = await fetch(toAbsoluteUrl(path), {
        ...options,
        headers: buildHeaders(options.headers, true, options.body ?? undefined)
      });
      if (retry.ok) {
        const retryData = (await retry.json()) as { data?: T } | T;
        return (retryData as { data?: T }).data ?? (retryData as T);
      }
    }
    onUnauthorized();
  }

  throw await toApiError(response);
};

export const lenderApiClient = {
  get: <T>(path: string, options?: RequestOptions) => executeRequest<T>(path, { ...options, method: "GET" }),
  post: <T>(path: string, body?: unknown, options?: RequestOptions) =>
    executeRequest<T>(path, { ...options, method: "POST", body: body instanceof FormData ? body : body ? JSON.stringify(body) : undefined }),
  patch: <T>(path: string, body?: unknown, options?: RequestOptions) =>
    executeRequest<T>(path, { ...options, method: "PATCH", body: body instanceof FormData ? body : body ? JSON.stringify(body) : undefined }),
  delete: <T>(path: string, options?: RequestOptions) => executeRequest<T>(path, { ...options, method: "DELETE" })
};
