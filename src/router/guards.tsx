import type { ReactNode } from "react";
import { Navigate } from "react-router-dom";

import { useAuthStore, type Role } from "@/store/authStore";

export function Protected({ children }: { children: ReactNode }) {
  const token = useAuthStore((s) => s.token);
  if (!token) return <Navigate to="/login" replace />;
  return children;
}

export function RoleGuard({ role, children }: { role: Role; children: ReactNode }) {
  const userRole = useAuthStore((s) => s.role);
  if (!userRole) return <Navigate to="/login" replace />;
  if (userRole !== role) return <Navigate to="/" replace />;
  return children;
}
