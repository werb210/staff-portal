import { verifyToken } from "@/services/authService";

export async function getSession() {
  const token = localStorage.getItem("token");
  if (!token) return null;

  try {
    const session = await verifyToken(token);
    return { user: session.user, token: session.token };
  } catch {
    return null;
  }
}
