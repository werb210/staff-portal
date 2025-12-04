// server/src/auth/ProtectedRoute.tsx
import { Navigate, useLocation } from "react-router-dom";
import { ReactNode } from "react";
import { useAuthStore } from "@/state/authStore";

type Props = {
  children: ReactNode;
};

export default function ProtectedRoute({ children }: Props) {
  const user = useAuthStore((s) => s.user);
  const location = useLocation();

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return <>{children}</>;
}
