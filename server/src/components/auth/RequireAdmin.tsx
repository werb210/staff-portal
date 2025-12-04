import { useAuthStore } from "@/state/authStore";
import { Navigate } from "react-router-dom";

export default function RequireAdmin({ children }: { children: JSX.Element }) {
  const { user } = useAuthStore();

  if (!user) return <Navigate to="/login" replace />;
  if (user.role !== "admin") return <Navigate to="/unauthorized" replace />;

  return children;
}
