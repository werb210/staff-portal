import { Navigate } from "react-router-dom";
import { useAuthStore } from "@/state/authStore";

export default function RequireAdmin({ children }: { children: JSX.Element }) {
  const user = useAuthStore((s) => s.user);

  if (!user || user.role !== "admin") {
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
}
