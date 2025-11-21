import http from "../api/http";
import { authStore } from "./authStore";

export async function fetchMe() {
  const token = authStore.getState().token;
  if (!token) {
    authStore.getState().logout();
    return;
  }

  try {
    const response = await http.get("/api/auth/me");
    const nextUser = (response.data as any)?.user ?? response.data;
    if (nextUser?.role) {
      authStore.getState().login(token, {
        id: nextUser.id,
        email: nextUser.email,
        role: nextUser.role,
      });
    }
  } catch (error: any) {
    if (error?.response?.status === 401) {
      authStore.getState().logout();
    } else {
      throw error;
    }
  }
}
