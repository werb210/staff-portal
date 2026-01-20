import { ACCESS_TOKEN_KEY, clearAccessToken, getAccessToken, setAccessToken } from "@/auth/auth.store";

export { ACCESS_TOKEN_KEY };
export const USER_KEY = "staff-portal.user";

const canUseSessionStorage = () =>
  typeof window !== "undefined" && typeof window.sessionStorage !== "undefined";

export function getStoredAccessToken(): string | null {
  return getAccessToken();
}

export function setStoredAccessToken(token: string) {
  setAccessToken(token);
}

export function clearStoredAuth() {
  clearAccessToken();
  if (!canUseSessionStorage()) return;
  try {
    window.sessionStorage.removeItem(USER_KEY);
  } catch {
    // ignore storage errors
  }
}

export function getStoredUser<T = unknown>(): T | null {
  if (!canUseSessionStorage()) return null;
  try {
    const stored = window.sessionStorage.getItem(USER_KEY);
    if (!stored) return null;
    return JSON.parse(stored) as T;
  } catch {
    return null;
  }
}

export function setStoredUser(user: unknown) {
  if (!canUseSessionStorage()) return;
  try {
    window.sessionStorage.setItem(USER_KEY, JSON.stringify(user));
  } catch {
    // ignore storage errors
  }
}
