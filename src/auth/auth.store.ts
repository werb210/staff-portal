export const ACCESS_TOKEN_KEY = "staff-portal.accessToken";

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
    window.sessionStorage.setItem(ACCESS_TOKEN_KEY, token);
  } catch {
    // ignore storage errors
  }
};

export function setAccessToken(token: string) {
  inMemoryAccessToken = token;
  writeStoredToken(token);
}

export function getAccessToken(): string | null {
  if (inMemoryAccessToken) return inMemoryAccessToken;
  const stored = readStoredToken();
  inMemoryAccessToken = stored;
  return stored;
}

export function clearAccessToken() {
  inMemoryAccessToken = null;
  writeStoredToken(null);
}
