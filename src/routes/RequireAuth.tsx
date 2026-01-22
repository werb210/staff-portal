import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/auth/AuthContext";
import AppLoading from "@/components/layout/AppLoading";
import { getRequestId } from "@/utils/requestId";
import { recordRedirect } from "@/utils/redirectGuard";

export default function RequireAuth({ children }: { children: JSX.Element }) {
  const auth = useAuth();
  const location = useLocation();
  const requestId = getRequestId();

  if (auth.authStatus === "loading") {
    return <AppLoading />;
  }

  if (auth.authStatus === "unauthenticated") {
    console.info("RequireAuth redirect", {
      requestId,
      route: location.pathname,
      authState: auth.authStatus,
      reason: "unauthenticated_redirect"
    });
    recordRedirect(location.pathname, "unauthenticated", location.key);
    return <Navigate to="/login" replace />;
  }

  return children;
}
