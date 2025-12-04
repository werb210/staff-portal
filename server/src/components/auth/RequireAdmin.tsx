import { Navigate } from "react-router-dom";
import { useAuthStore } from "@/state/authStore";

export default function RequireAdmin({ children }: { children: JSX.Element }) {
  const { user } = useAuthStore();
  if (!user || user.role !== "admin") return <Navigate to="/" replace />;
  return children;
}
