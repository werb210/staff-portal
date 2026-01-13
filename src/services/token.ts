export const ACCESS_TOKEN_KEY = "boreal.accessToken";
export const REFRESH_TOKEN_KEY = "boreal.refreshToken";
export const USER_KEY = "staff-portal.user";

/**
 * Session persistence rules (staff portal):
 * - Local storage keeps access token, refresh token, and user profile across reloads.
 * - In-memory values mirror local storage and are used when storage is unavailable.
 * - A hard logout clears both local storage and in-memory values.
 */
let inMemoryToken: string | null = null;
let inMemoryRefreshToken: string | null = null;
let inMemoryUser: string | null = null;

const getLocalStorage = (): Storage | null => {
  try {
    return window.localStorage;
  } catch (error) {
    return null;
  }
};

export function getStoredAccessToken(): string | null {
  const storage = getLocalStorage();
  return storage?.getItem(ACCESS_TOKEN_KEY) ?? inMemoryToken;
}

export function setStoredAccessToken(token: string) {
  const storage = getLocalStorage();
  if (storage) {
    storage.setItem(ACCESS_TOKEN_KEY, token);
  }
  inMemoryToken = token;
}

export function clearStoredAccessToken() {
  const storage = getLocalStorage();
  if (storage) {
    storage.removeItem(ACCESS_TOKEN_KEY);
  }
  inMemoryToken = null;
}

export function getStoredRefreshToken(): string | null {
  const storage = getLocalStorage();
  return storage?.getItem(REFRESH_TOKEN_KEY) ?? inMemoryRefreshToken;
}

export function setStoredRefreshToken(token: string) {
  const storage = getLocalStorage();
  if (storage) {
    storage.setItem(REFRESH_TOKEN_KEY, token);
  }
  inMemoryRefreshToken = token;
}

export function setStoredTokens(tokens: { accessToken: string; refreshToken: string }) {
  setStoredAccessToken(tokens.accessToken);
  setStoredRefreshToken(tokens.refreshToken);
}

export function clearStoredRefreshToken() {
  const storage = getLocalStorage();
  if (storage) {
    storage.removeItem(REFRESH_TOKEN_KEY);
  }
  inMemoryRefreshToken = null;
}

export function getStoredUser<T = unknown>(): T | null {
  const storage = getLocalStorage();
  const raw = storage?.getItem(USER_KEY) ?? inMemoryUser;
  if (!raw) return null;
  try {
    return JSON.parse(raw) as T;
  } catch (error) {
    clearStoredAuth();
    return null;
  }
}

export function setStoredUser<T = unknown>(user: T) {
  const storage = getLocalStorage();
  const payload = JSON.stringify(user);
  if (storage) {
    storage.setItem(USER_KEY, payload);
  }
  inMemoryUser = payload;
}

export function clearStoredUser() {
  const storage = getLocalStorage();
  if (storage) {
    storage.removeItem(USER_KEY);
  }
  inMemoryUser = null;
}

export function clearStoredAuth() {
  clearStoredAccessToken();
  clearStoredRefreshToken();
  clearStoredUser();
}
