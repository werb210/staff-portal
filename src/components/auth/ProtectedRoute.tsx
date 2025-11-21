import { Navigate } from "react-router-dom";
import { useAuthStore } from "@/store/useAuthStore";

export function ProtectedRoute({ children }) {
  const { user, isReady } = useAuthStore();

  if (!isReady) return null;
  if (!user) return <Navigate to="/login" replace />;

  return children;
}
