import http from "@/lib/http";

export async function login(email: string, password: string) {
  const response = await http.post("/api/users/login", { email, password });
  return response.data;
}

export async function me() {
  const response = await http.get("/api/users/me");
  return response.data;
}
