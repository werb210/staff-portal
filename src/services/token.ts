export const ACCESS_TOKEN_KEY = "accessToken";
export const USER_KEY = "user";

export function getStoredAccessToken(): string | null {
  return localStorage.getItem(ACCESS_TOKEN_KEY);
}

export function setStoredAccessToken(token: string) {
  localStorage.setItem(ACCESS_TOKEN_KEY, token);
}

export function clearStoredAuth() {
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

export function getStoredUser<T = unknown>(): T | null {
  const stored = localStorage.getItem(USER_KEY);
  if (!stored) {
    return null;
  }
  try {
    return JSON.parse(stored) as T;
  } catch {
    return null;
  }
}

export function setStoredUser(user: unknown) {
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}
