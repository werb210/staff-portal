import { Navigate } from "react-router-dom";
import { useAuthStore } from "../lib/auth/useAuthStore";

export function Protected({ children }: { children: JSX.Element }) {
  const token = useAuthStore((s) => s.token);

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return children;
}
