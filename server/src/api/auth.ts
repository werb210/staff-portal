import { http } from "@/lib/api/http";

export const AuthAPI = {
  login: (email: string, password: string) =>
    http.post("/auth/login", { email, password }),

  me: () => http.get("/auth/me"),

  logout: () => http.post("/auth/logout"),
};
