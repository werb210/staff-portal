import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/auth/AuthContext";
import AppLoading from "@/components/layout/AppLoading";
import { getRequestId } from "@/utils/requestId";
import { recordRedirect } from "@/utils/redirectGuard";

const LoadingScreen = () => <AppLoading />;

export function ProtectedRoute({ children }: { children: JSX.Element }) {
  const auth = useAuth();
  const location = useLocation();
  const requestId = getRequestId();

  if (auth.authState === "authenticated_pending") {
    return <LoadingScreen />;
  }

  if (auth.authState === "unauthenticated") {
    console.info("Route guard decision", {
      requestId,
      route: location.pathname,
      authState: auth.authState,
      reason: "unauthenticated_redirect"
    });
    recordRedirect(location.pathname, "unauthenticated", location.key);
    return <Navigate to="/login" replace />;
  }

  console.info("Route guard decision", {
    requestId,
    route: location.pathname,
    authState: auth.authState,
    reason: auth.rolesStatus === "resolved" ? "authenticated" : "roles_loading"
  });
  return children;
}
