import { Navigate } from "react-router-dom";
import { useAuthStore } from "../state/authStore";

export default function ProtectedRoute({ children }: { children: JSX.Element }) {
  const user = useAuthStore((s) => s.user);
  const loading = useAuthStore((s) => s.loading);

  if (loading) return <div>Loading...</div>;
  if (!user) return <Navigate to="/login" replace />;

  return children;
}
