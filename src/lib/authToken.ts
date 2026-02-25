import { ENV } from "@/config/env";
import { decodeJwt } from "@/auth/jwt";

const ACCESS_TOKEN_KEY = ENV.JWT_STORAGE_KEY;

let inMemoryAccessToken: string | null = null;

const canUseSessionStorage = () =>
  typeof window !== "undefined" && typeof window.sessionStorage !== "undefined";

const readStoredToken = (): string | null => {
  if (!canUseSessionStorage()) return null;
  try {
    return window.sessionStorage.getItem(ACCESS_TOKEN_KEY);
  } catch {
    return null;
  }
};

const writeStoredToken = (token: string | null) => {
  if (!canUseSessionStorage()) return;
  try {
    if (!token) {
      window.sessionStorage.removeItem(ACCESS_TOKEN_KEY);
      return;
    }
    // Security: keep JWTs scoped to browser session to reduce persistence risk after tab/browser close.
    window.sessionStorage.setItem(ACCESS_TOKEN_KEY, token);
  } catch {
    // ignore storage errors
  }
};

const isExpired = (token: string | null) => {
  const payload = decodeJwt(token);
  if (!payload?.exp) return false;
  return payload.exp * 1000 <= Date.now();
};

export function getAccessToken(): string | null {
  const token = inMemoryAccessToken ?? readStoredToken();
  if (isExpired(token)) {
    clearAccessToken();
    return null;
  }
  inMemoryAccessToken = token;
  return token;
}

export function setAccessToken(token: string) {
  inMemoryAccessToken = token;
  writeStoredToken(token);
}

export function clearAccessToken() {
  inMemoryAccessToken = null;
  writeStoredToken(null);
}

export { ACCESS_TOKEN_KEY };
