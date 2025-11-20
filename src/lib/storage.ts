const TOKEN_KEY = "bf_token";
const ROLE_KEY = "bf_role";

export function setToken(token: string) {
  localStorage.setItem(TOKEN_KEY, token);
}

export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function clearToken() {
  localStorage.removeItem(TOKEN_KEY);
}

export function setRole(role: string) {
  localStorage.setItem(ROLE_KEY, role);
}

export function getRole() {
  return localStorage.getItem(ROLE_KEY);
}

export function clearRole() {
  localStorage.removeItem(ROLE_KEY);
}

export function logout() {
  clearToken();
  clearRole();
}

// Legacy helpers for existing imports
export function saveAuth(token: string, role: string) {
  setToken(token);
  setRole(role);
}

export function clearAuth() {
  logout();
}
