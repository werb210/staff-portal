import api from "../lib/api";

export async function loginRequest(email: string, password: string) {
  const res = await api.post("/auth/login", { email, password });
  return res.data;
}

export async function fetchCurrentUser() {
  const res = await api.get("/auth/me");
  return res.data;
}
