import { ACCESS_TOKEN_KEY, clearAccessToken, getAccessToken, setAccessToken } from "@/auth/auth.store";

export { ACCESS_TOKEN_KEY };
export const USER_KEY = "user";

export function getStoredAccessToken(): string | null {
  return getAccessToken();
}

export function setStoredAccessToken(token: string) {
  setAccessToken(token);
}

export function clearStoredAuth() {
  clearAccessToken();
  localStorage.removeItem(USER_KEY);
}

export function getStoredUser<T = unknown>(): T | null {
  const stored = localStorage.getItem(USER_KEY);
  if (!stored) return null;
  try {
    return JSON.parse(stored) as T;
  } catch {
    return null;
  }
}

export function setStoredUser(user: unknown) {
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}
