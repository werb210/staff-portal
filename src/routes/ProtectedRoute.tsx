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

  if (auth.authStatus === "loading" || auth.rolesStatus === "loading") {
    return <LoadingScreen />;
  }

  if (auth.authStatus === "authenticated" && !auth.user) {
    return <LoadingScreen />;
  }

  if (auth.authStatus === "unauthenticated") {
    console.info("Route guard decision", {
      requestId,
      route: location.pathname,
      authState: auth.authStatus,
      reason: "unauthenticated_redirect"
    });
    recordRedirect(location.pathname, "unauthenticated", location.key);
    return <Navigate to="/login" replace />;
  }

  console.info("Route guard decision", {
    requestId,
    route: location.pathname,
    authState: auth.authStatus,
    reason: auth.rolesStatus === "resolved" ? "authenticated" : "roles_loading"
  });
  return children;
}
