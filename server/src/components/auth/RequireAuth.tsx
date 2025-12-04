import { Navigate, useLocation } from "react-router-dom";
import { useAuthStore } from "@/state/authStore";

export default function RequireAuth({ children }: { children: JSX.Element }) {
  const { isAuthenticated } = useAuthStore();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  return children;
}
