import type { AxiosError, AxiosRequestConfig, AxiosResponse } from "axios";
import { getRequestId } from "@/utils/requestId";
import { setLastApiRequest } from "@/state/apiRequestTrace";
import { endPendingRequest, startPendingRequest } from "@/utils/requestTracking";

type Redactable = Record<string, unknown> | unknown[] | string | number | boolean | null | undefined;

const SENSITIVE_KEYS = [
  "authorization",
  "cookie",
  "set-cookie",
  "password",
  "token",
  "refresh",
  "access",
  "secret",
  "apikey",
  "api_key"
];

const isSensitiveKey = (key: string) =>
  SENSITIVE_KEYS.some((sensitive) => key.toLowerCase().includes(sensitive));

const redactSensitive = (value: Redactable): Redactable => {
  if (Array.isArray(value)) {
    return value.map((entry) => redactSensitive(entry));
  }
  if (value && typeof value === "object") {
    const result: Record<string, unknown> = {};
    Object.entries(value as Record<string, unknown>).forEach(([key, val]) => {
      result[key] = isSensitiveKey(key) ? "[REDACTED]" : redactSensitive(val as Redactable);
    });
    return result;
  }
  return value;
};

const serialize = (value: unknown) => {
  if (value === undefined) return "undefined";
  if (typeof value === "string") return value;
  try {
    return JSON.stringify(value);
  } catch {
    return String(value);
  }
};

const truncate = (value: string, max = 1024) => (value.length > max ? `${value.slice(0, max)}…` : value);

export const buildRequestUrl = (config: AxiosRequestConfig) => {
  const base = config.baseURL ?? "";
  const url = config.url ?? "";
  if (!base) return url;
  if (!url) return base;
  if (base.endsWith("/") && url.startsWith("/")) {
    return `${base}${url.slice(1)}`;
  }
  if (!base.endsWith("/") && !url.startsWith("/")) {
    return `${base}/${url}`;
  }
  return `${base}${url}`;
};

export const attachRequestIdAndLog = (config: AxiosRequestConfig) => {
  const requestId = getRequestId();
  const headers = { ...(config.headers ?? {}) } as Record<string, unknown>;
  headers["X-Request-Id"] = requestId;
  config.headers = headers;

  if (!headers["X-Request-Id"]) {
    throw new Error("Missing X-Request-Id header on request");
  }

  const pendingId = startPendingRequest(config);
  (config as AxiosRequestConfig & { __pendingId?: string }).__pendingId = pendingId;

  const sanitizedHeaders = redactSensitive(headers);
  const payload = config.data ? redactSensitive(config.data as Redactable) : undefined;

  console.info("API request", {
    requestId,
    method: config.method?.toUpperCase(),
    url: buildRequestUrl(config),
    headers: sanitizedHeaders,
    payload
  });

  return config;
};

export const logResponse = (response: AxiosResponse) => {
  const requestId = getRequestId();
  const pendingId = (response.config as AxiosRequestConfig & { __pendingId?: string }).__pendingId;
  endPendingRequest(pendingId);

  const responseData = truncate(serialize(response.data));

  console.info("API response", {
    requestId,
    status: response.status,
    data: responseData
  });

  setLastApiRequest({
    path: buildRequestUrl(response.config),
    method: response.config.method?.toUpperCase(),
    status: response.status,
    requestId,
    timestamp: Date.now()
  });

  return response;
};

export const logError = (error: AxiosError) => {
  const requestId = getRequestId();
  const config = error.config ?? {};
  const pendingId = (config as AxiosRequestConfig & { __pendingId?: string }).__pendingId;
  endPendingRequest(pendingId);

  console.error("API error", {
    requestId,
    method: config.method?.toUpperCase(),
    url: buildRequestUrl(config),
    status: error.response?.status,
    code: error.code,
    message: error.message
  });

  setLastApiRequest({
    path: buildRequestUrl(config),
    method: config.method?.toUpperCase(),
    status: error.response?.status,
    requestId,
    timestamp: Date.now()
  });

  return Promise.reject(error);
};
