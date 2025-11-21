import api from "@/lib/api/client";

export async function login(email: string, password: string) {
  const res = await api.post("/api/auth/login", { email, password });

  if (res.data?.token) {
    localStorage.setItem("token", res.data.token);
  }

  return res.data as { user?: any; token?: string } | undefined;
}

export async function getSession() {
  const res = await api.get("/api/auth/session");
  return res.data;
}
