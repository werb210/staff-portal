// ======================================================================
// src/routes/ProtectedRoute.tsx
// Canonical protected-route logic for Staff App
// - Blocks unauthenticated users
// - Supports role-restricted routes
// - Prevents blank screens during auth boot
// ======================================================================

import { Navigate, Outlet } from "react-router-dom";
import { useAuthContext } from "../context/AuthContext";

interface ProtectedRouteProps {
  redirectTo?: string;
  allowedRoles?: Array<"Admin" | "Staff" | "Lender" | "Referrer">;
}

export const ProtectedRoute = ({
  redirectTo = "/login",
  allowedRoles,
}: ProtectedRouteProps) => {
  const { user, loading } = useAuthContext();

  // -----------------------------------------------
  // Still booting → show blocking loader
  // -----------------------------------------------
  if (loading) {
    return <div className="page-loading">Loading...</div>;
  }

  // -----------------------------------------------
  // No authenticated user → go to login
  // -----------------------------------------------
  if (!user) {
    return <Navigate to={redirectTo} replace />;
  }

  // -----------------------------------------------
  // Role restrictions (Admin/Staff/Lender/Referrer)
  // -----------------------------------------------
  if (allowedRoles && !allowedRoles.includes(user.role as any)) {
    // Always redirect to dashboard if user lacks role
    return <Navigate to="/" replace />;
  }

  // -----------------------------------------------
  // Authenticated + allowed → continue
  // -----------------------------------------------
  return <Outlet />;
};
