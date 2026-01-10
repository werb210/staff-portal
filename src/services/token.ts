export const ACCESS_TOKEN_KEY = "accessToken";
export const REFRESH_TOKEN_KEY = "refreshToken";
export const USER_KEY = "staff-portal.user";

let inMemoryToken: string | null = null;
let inMemoryRefreshToken: string | null = null;
let inMemoryUser: string | null = null;

const getSessionStorage = (): Storage | null => {
  try {
    return window.sessionStorage;
  } catch (error) {
    return null;
  }
};

export function getStoredAccessToken(): string | null {
  const storage = getSessionStorage();
  return storage?.getItem(ACCESS_TOKEN_KEY) ?? inMemoryToken;
}

export function setStoredAccessToken(token: string) {
  const storage = getSessionStorage();
  if (storage) {
    storage.setItem(ACCESS_TOKEN_KEY, token);
  }
  inMemoryToken = token;
}

export function clearStoredAccessToken() {
  const storage = getSessionStorage();
  if (storage) {
    storage.removeItem(ACCESS_TOKEN_KEY);
  }
  inMemoryToken = null;
}

export function getStoredRefreshToken(): string | null {
  const storage = getSessionStorage();
  return storage?.getItem(REFRESH_TOKEN_KEY) ?? inMemoryRefreshToken;
}

export function setStoredRefreshToken(token: string) {
  const storage = getSessionStorage();
  if (storage) {
    storage.setItem(REFRESH_TOKEN_KEY, token);
  }
  inMemoryRefreshToken = token;
}

export function clearStoredRefreshToken() {
  const storage = getSessionStorage();
  if (storage) {
    storage.removeItem(REFRESH_TOKEN_KEY);
  }
  inMemoryRefreshToken = null;
}

export function getStoredUser<T = unknown>(): T | null {
  const storage = getSessionStorage();
  const raw = storage?.getItem(USER_KEY) ?? inMemoryUser;
  if (!raw) return null;
  try {
    return JSON.parse(raw) as T;
  } catch (error) {
    return null;
  }
}

export function setStoredUser<T = unknown>(user: T) {
  const storage = getSessionStorage();
  const payload = JSON.stringify(user);
  if (storage) {
    storage.setItem(USER_KEY, payload);
  }
  inMemoryUser = payload;
}

export function clearStoredUser() {
  const storage = getSessionStorage();
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
