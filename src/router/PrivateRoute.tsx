import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/auth/AuthContext";
import { getRequestId } from "@/utils/requestId";
import { recordRedirect } from "@/utils/redirectGuard";

export default function PrivateRoute({ children }: { children: JSX.Element }) {
  const auth = useAuth();
  const location = useLocation();
  const requestId = getRequestId();

  if (auth.status === "loading") {
    console.info("Route guard decision", {
      requestId,
      route: location.pathname,
      authState: auth.status,
      reason: "auth_loading"
    });
    return null;
  }

  if (!auth.user) {
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
