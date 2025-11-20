const TOKEN_KEY = "token";
const ROLE_KEY = "role";

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string) {
  localStorage.setItem(TOKEN_KEY, token);
}

export function setUserRole(role: string) {
  localStorage.setItem(ROLE_KEY, role);
}

export function clearAuth() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(ROLE_KEY);
}

// Backwards compatibility for existing imports
export const clearToken = clearAuth;

export function isAuthenticated(): boolean {
  return Boolean(getToken());
}

export function getUserRole(): string | null {
  return localStorage.getItem(ROLE_KEY) || null;
}
