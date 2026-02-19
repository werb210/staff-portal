import type { JSX } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { clearAuth, getAccessToken, getUserRole, isTokenExpired } from "@/lib/authStorage";

interface GuardProps {
  children: JSX.Element;
  allowedRoles?: string[];
}

export function AuthGuard({ children, allowedRoles }: GuardProps) {
  const location = useLocation();
  const publicPaths = new Set(["/login", "/auth/callback", "/auth/microsoft/callback"]);

  if (publicPaths.has(location.pathname)) {
    return children;
  }

  const token = getAccessToken();
  const role = getUserRole();

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  if (isTokenExpired(token)) {
    clearAuth();
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(role || "")) {
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
}
