export function saveAuth(token: string, role: string) {
  localStorage.setItem("token", token);
  localStorage.setItem("role", role);
}

export function clearAuth() {
  localStorage.removeItem("token");
  localStorage.removeItem("role");
}

export function getToken(): string | null {
  return localStorage.getItem("token");
}

export function getRole(): string | null {
  return localStorage.getItem("role");
}
