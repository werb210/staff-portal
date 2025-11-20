import { getRole, getToken, logout, setRole, setToken as setStoredToken } from "./storage";

export { getToken };

export function setToken(token: string) {
  setStoredToken(token);
}

export function setUserRole(role: string) {
  setRole(role);
}

export function clearAuth() {
  logout();
}

export const clearToken = clearAuth;

export function isAuthenticated(): boolean {
  return Boolean(getToken());
}

export function getUserRole(): string | null {
  return getRole();
}
