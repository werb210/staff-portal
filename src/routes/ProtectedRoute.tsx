import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/auth/AuthContext";
import { getRequestId } from "@/utils/requestId";
import { recordRedirect } from "@/utils/redirectGuard";

export function ProtectedRoute({ children }: { children: JSX.Element }) {
  const auth = useAuth();
  const location = useLocation();
  const requestId = getRequestId();
  const isRolePending = auth.status === "authenticated" && auth.user?.role === undefined;

  if (auth.status === "loading" || isRolePending) {
    console.info("Route guard decision", {
      requestId,
      route: location.pathname,
      authState: auth.status,
      reason: isRolePending ? "roles_loading" : "auth_loading"
    });
    return null; // wait for hydration
  }

  if (auth.status === "unauthenticated") {
    console.info("Route guard decision", {
      requestId,
      route: location.pathname,
      authState: auth.status,
      reason: "unauthenticated_redirect"
    });
    recordRedirect(location.pathname, "unauthenticated", location.key);
    return <Navigate to="/login" replace />;
  }

  console.info("Route guard decision", {
    requestId,
    route: location.pathname,
    authState: auth.status,
    reason: "authenticated"
  });
  return children;
}
