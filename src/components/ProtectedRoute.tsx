import { type ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function ProtectedRoute({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();

  if (loading) return <div className="p-4">Loading…</div>;
  if (!user) return <Navigate to="/login" replace />;

  return <>{children}</>;
}
