import api from "../../lib/api";
import { setToken, setRole } from "../../lib/storage";

export interface LoginPayload {
  email: string;
  password: string;
}

export async function login(payload: LoginPayload) {
  const res = await api.post("/api/auth/login", payload);

  const { token, role } = res.data;

  if (!token) throw new Error("No token returned from server");
  if (!role) throw new Error("No user role returned");

  setToken(token);
  setRole(role);

  return { token, role };
}
