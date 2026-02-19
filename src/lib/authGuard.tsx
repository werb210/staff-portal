import type { JSX } from "react";
import { Navigate } from "react-router-dom";
import { getAccessToken, getUserRole } from "@/lib/authStorage";

interface GuardProps {
  children: JSX.Element;
  allowedRoles?: string[];
}

export function AuthGuard({ children, allowedRoles }: GuardProps) {
  const token = getAccessToken();
  const role = getUserRole();

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(role || "")) {
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
}
