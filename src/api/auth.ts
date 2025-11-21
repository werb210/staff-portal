import { api } from "./client";

export async function login(email: string, password: string) {
  const res = await api("/api/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });

  if ((res as any)?.token) {
    localStorage.setItem("token", (res as any).token);
  }

  return res as { user?: any; token?: string } | undefined;
}

export async function getSession() {
  return api("/api/auth/session");
}
