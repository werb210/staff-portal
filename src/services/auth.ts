import api from "../lib/api";

export type LoginPayload = {
  email: string;
  password: string;
};

export const AuthAPI = {
  login: (payload: LoginPayload) => api.post("/api/auth/login", payload),
  me: () => api.get("/api/auth/me"),
};
