import type { ReactNode } from "react";
import { useAuth } from "../context/AuthContext";

type ProtectedRouteProps = {
  children: ReactNode;
  requiredRole?: "admin" | "staff";
};

export default function ProtectedRoute({ children, requiredRole }: ProtectedRouteProps) {
  const { role } = useAuth();

  if (!role) return <div>Unauthorized</div>;

  if (requiredRole && role !== requiredRole) {
    return <div>Access Restricted</div>;
  }

  return <>{children}</>;
}
