import api from "@/lib/http";

export async function login(email: string, password: string) {
  const res = await api.post("/api/users/login", { email, password });
  return res.data;
}
