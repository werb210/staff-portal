const TOKEN_KEY = "staff_portal_token";
const ROLE_KEY = "staff_portal_role";
const EMAIL_KEY = "staff_portal_email";

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

export function setEmail(email: string) {
  localStorage.setItem(EMAIL_KEY, email);
}

export function getEmail() {
  return localStorage.getItem(EMAIL_KEY);
}

export function clearEmail() {
  localStorage.removeItem(EMAIL_KEY);
}

export function logout() {
  clearToken();
  clearRole();
  clearEmail();
}

// Legacy helpers for existing imports
export function saveAuth(token: string, role: string) {
  setToken(token);
  setRole(role);
}

export function clearAuth() {
  logout();
}
