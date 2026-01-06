export const ACCESS_TOKEN_KEY = "accessToken";

let inMemoryToken: string | null = null;

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
