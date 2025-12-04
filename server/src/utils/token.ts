import { useAuthStore } from "@/state/authStore";

export function getToken() {
  return useAuthStore.getState().token;
}
