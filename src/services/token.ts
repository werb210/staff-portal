import { ACCESS_TOKEN_KEY, clearAccessToken, getAccessToken, setAccessToken } from "@/lib/authToken";

export { ACCESS_TOKEN_KEY };
export const USER_KEY = "staff-portal.user";

const canUseLocalStorage = () =>
  typeof window !== "undefined" && typeof window.localStorage !== "undefined";

export function getStoredAccessToken(): string | null {
  return getAccessToken();
}

export function setStoredAccessToken(token: string) {
  setAccessToken(token);
}

export function clearStoredAuth() {
  clearAccessToken();
  if (!canUseLocalStorage()) return;
  try {
    window.localStorage.removeItem(USER_KEY);
  } catch {
    // ignore storage errors
  }
}

export function getStoredUser<T = unknown>(): T | null {
  if (!canUseLocalStorage()) return null;
  try {
    const stored = window.localStorage.getItem(USER_KEY);
    if (!stored) return null;
    return JSON.parse(stored) as T;
  } catch {
    return null;
  }
}

export function setStoredUser(user: unknown) {
  if (!canUseLocalStorage()) return;
  try {
    window.localStorage.setItem(USER_KEY, JSON.stringify(user));
  } catch {
    // ignore storage errors
  }
}
