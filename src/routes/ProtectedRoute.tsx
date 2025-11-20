// src/routes/ProtectedRoute.tsx
import { useAuthStore } from "../state/authStore";
import { Navigate } from "react-router-dom";

export default function ProtectedRoute({ children }: { children: JSX.Element }) {
  const token = useAuthStore((s) => s.token);

  if (!token) return <Navigate to="/login" replace />;

  return children;
}

