const KEY = "bf_staff_token";

export function getAuthToken(): string | null {
  return localStorage.getItem(KEY);
}

export function setAuthToken(token: string) {
  localStorage.setItem(KEY, token);
}

export function clearAuthToken() {
  localStorage.removeItem(KEY);
}
