import { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";

import { Role, authStore } from "./auth.store";
import { useMe } from "./auth.hooks";

type ProtectedRouteProps = {
  roles?: Role[];
  children: ReactNode;
};

export default function ProtectedRoute({ roles, children }: ProtectedRouteProps) {
  const location = useLocation();
  const { isAuthenticated, user } = authStore();
  const token = authStore((state) => state.token);

  const shouldFetchUser = Boolean(token) && !user;
  const { isFetching } = useMe({ enabled: shouldFetchUser });

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  if (roles && roles.length > 0) {
    if (!user && isFetching) return null;
    if (!user || !roles.includes(user.role)) {
      return <Navigate to="/dashboard" replace />;
    }
  }

  return <>{children}</>;
}
