const ACCESS_TOKEN_KEY = "staff_access_token";

let inMemoryAccessToken: string | null = null;

const canUseLocalStorage = () =>
  typeof window !== "undefined" && typeof window.localStorage !== "undefined";

const readStoredToken = (): string | null => {
  if (!canUseLocalStorage()) return null;
  try {
    return window.localStorage.getItem(ACCESS_TOKEN_KEY);
  } catch {
    return null;
  }
};

const writeStoredToken = (token: string | null) => {
  if (!canUseLocalStorage()) return;
  try {
    if (!token) {
      window.localStorage.removeItem(ACCESS_TOKEN_KEY);
      return;
    }
    window.localStorage.setItem(ACCESS_TOKEN_KEY, token);
  } catch {
    // ignore storage errors
  }
};

export function getAccessToken(): string | null {
  if (inMemoryAccessToken) return inMemoryAccessToken;
  const stored = readStoredToken();
  inMemoryAccessToken = stored;
  return stored;
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
