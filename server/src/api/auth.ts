import { api } from "@/lib/apiClient";
import { httpPost } from "@/lib/http";
import { useAuthStore } from "@/state/authStore";

export async function login(email: string, password: string) {
  const res = await httpPost(api.url("/api/auth/login"), { email, password });
  useAuthStore.getState().setAuth(res.token, res.user);
  return res.user;
}
