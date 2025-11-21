import { useAuthStore } from "./useAuthStore";

export function requireRole(allowed: string[]) {
  const user = useAuthStore.getState().user;
  if (!user) return false;
  return allowed.includes(user.role);
}
