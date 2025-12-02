import { Navigate } from "react-router-dom";
import { useAuthStore } from "../../state/authStore";
import type { Role } from "../../state/authStore";

export default function RequireRole({
  role,
  children,
}: {
  role: Role;
  children: JSX.Element;
}) {
  const { user } = useAuthStore();

  if (!user) return <Navigate to="/login" replace />;
  if (user.role !== role) return <Navigate to="/unauthorized" replace />;

  return children;
}
