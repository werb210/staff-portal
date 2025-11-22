import { PropsWithChildren } from "react";
import { Navigate, useLocation } from "react-router-dom";

import { useAuthStore } from "../../core/auth.store";

export function ProtectedRoute({ children }: PropsWithChildren) {
  const accessToken = useAuthStore((state) => state.accessToken);
  const location = useLocation();
  const from = `${location.pathname}${location.search}`;

  if (!accessToken) {
    return <Navigate to="/login" state={{ from }} replace />;
  }

  return <>{children}</>;
}
