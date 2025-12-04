import { Navigate, useLocation } from "react-router-dom";
import { useAuthStore } from "@/state/authStore";

export default function RequireAuth({ children }: { children: JSX.Element }) {
  const token = useAuthStore((s) => s.token);
  const location = useLocation();

  if (!token) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
}
