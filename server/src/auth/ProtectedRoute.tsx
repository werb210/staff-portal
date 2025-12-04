import { Navigate } from "react-router-dom";
import { useAuthStore } from "@/state/authStore";

export default function ProtectedRoute({ children }: { children: JSX.Element }) {
  const { user, loading } = useAuthStore();

  if (loading) return null;

  if (!user) return <Navigate to="/login" replace />;

  return children;
}
