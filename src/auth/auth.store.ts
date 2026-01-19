export const ACCESS_TOKEN_KEY = "access_token";

export function setAccessToken(token: string) {
  localStorage.setItem(ACCESS_TOKEN_KEY, token);
}

export function getAccessToken(): string | null {
  return localStorage.getItem(ACCESS_TOKEN_KEY);
}

export function clearAccessToken() {
  localStorage.removeItem(ACCESS_TOKEN_KEY);
}
