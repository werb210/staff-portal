import axios from "axios";
import { authStore, Role } from "./authStore";

function validateRole(role: string | null | undefined): role is Role {
  return role === "admin" || role === "staff" || role === "lender" || role === "referrer";
}

export async function login(email: string, password: string) {
  const response = await axios.post(`${import.meta.env.VITE_API_URL}/api/auth/login`, {
    email,
    password,
  });

  const { token, user } = response.data ?? {};
  if (!token || !user || !validateRole(user.role)) {
    throw new Error("Invalid login response");
  }

  authStore.getState().login(token, { ...user, role: user.role });
  return { success: true as const };
}
