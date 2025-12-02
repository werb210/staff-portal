import { Navigate, Outlet } from "react-router-dom";
import { useAuthStore } from "../state/authStore";

export default function ProtectedRoute({
  roles,
}: {
  roles?: string[];
}) {
  const token = useAuthStore((s) => s.token);
  const user = useAuthStore((s) => s.user);

  if (!token || !user) return <Navigate to="/login" replace />;

  if (roles && !roles.includes(user.role))
    return <Navigate to="/dashboard" replace />;

  return <Outlet />;
}
