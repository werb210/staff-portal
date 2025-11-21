import { Navigate, Outlet } from "react-router-dom";

import { useAuthStore } from "@/store/useAuthStore";

interface ProtectedRouteProps {
  roles?: string[];
}

export default function ProtectedRoute({ roles }: ProtectedRouteProps) {
  const { token, user, role } = useAuthStore((state) => ({
    token: state.token,
    user: state.user,
    role: state.role ?? (state.user as { role?: string } | null)?.role ?? null,
  }));

  if (!token || !user) {
    return <Navigate to="/login" replace />;
  }

  if (roles && roles.length > 0) {
    const userRole = (role ?? (user as { role?: string }).role ?? null)?.toString();
    if (!userRole || !roles.includes(userRole)) {
      return <Navigate to="/" replace />;
    }
  }

  return <Outlet />;
}
