import { setAccessToken } from "@/lib/authToken";

const REFRESH_TOKEN_KEY = "staff_refresh_token";

let inMemoryRefreshToken: string | null = null;

const canUseLocalStorage = () =>
  typeof window !== "undefined" && typeof window.localStorage !== "undefined";

const readStoredRefreshToken = (): string | null => {
  if (!canUseLocalStorage()) return null;
  try {
    return window.localStorage.getItem(REFRESH_TOKEN_KEY);
  } catch {
    return null;
  }
};

const writeStoredRefreshToken = (token: string | null) => {
  if (!canUseLocalStorage()) return;
  try {
    if (!token) {
      window.localStorage.removeItem(REFRESH_TOKEN_KEY);
      return;
    }
    window.localStorage.setItem(REFRESH_TOKEN_KEY, token);
  } catch {
    // ignore storage errors
  }
};

export const authStore = {
  setTokens(access: string, refresh: string) {
    setAccessToken(access);
    inMemoryRefreshToken = refresh;
    writeStoredRefreshToken(refresh);
  },
  getRefreshToken(): string | null {
    if (inMemoryRefreshToken) return inMemoryRefreshToken;
    const stored = readStoredRefreshToken();
    inMemoryRefreshToken = stored;
    return stored;
  }
};
