import { Navigate, useLocation } from "react-router-dom";
import AppLoading from "@/components/layout/AppLoading";
import { useAuth } from "@/auth/AuthContext";
import { getRequestId } from "@/utils/requestId";
import { recordRedirect } from "@/utils/redirectGuard";

export default function RequireAuth({ children }: { children: JSX.Element }) {
  const auth = useAuth();
  const location = useLocation();
  const requestId = getRequestId();

  const isRolePending = auth.status === "authenticated" && auth.user?.role === undefined;

  if (auth.status === "loading" || isRolePending) {
    return <AppLoading />;
  }

  if (auth.status === "unauthenticated") {
    console.info("RequireAuth redirect", {
      requestId,
      route: location.pathname,
      authState: auth.status,
      reason: "unauthenticated_redirect"
    });
    recordRedirect(location.pathname, "unauthenticated", location.key);
    return <Navigate to="/login" replace />;
  }

  return children;
}
