import { Navigate } from "react-router-dom";
import { useAuth } from "@/auth/AuthContext";
import AppLoading from "@/components/layout/AppLoading";
import type { UserRole } from "@/utils/roles";

type PrivateRouteProps = {
  children: JSX.Element;
  allowedRoles?: UserRole[];
};

export default function PrivateRoute({ children }: PrivateRouteProps) {
  const { status, authReady } = useAuth();

  if (!authReady || status === "loading") return <AppLoading />;
  if (status === "unauthenticated") return <Navigate to="/login" replace />;

  return children;
}
