import type { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";

interface Props {
  roles: string[];
  children: ReactNode;
}

export default function RequireRole({ roles, children }: Props) {
  const { user } = useAuth();

  if (!user) return <Navigate to="/login" replace />;
  if (!roles.includes(String(user.role ?? ""))) return <Navigate to="/unauthorized" replace />;

  return <>{children}</>;
}
