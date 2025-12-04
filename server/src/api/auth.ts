// server/src/api/auth.ts
import { apiRequest } from "../lib/http";

export async function login(email: string, password: string) {
  const data = await apiRequest("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });

  localStorage.setItem("bf_token", data.token);
  return data.user;
}

export function logout() {
  localStorage.removeItem("bf_token");
  window.location.href = "/login";
}

export function getToken() {
  return localStorage.getItem("bf_token");
}
