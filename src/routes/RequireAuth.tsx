import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import AppLoading from "@/components/layout/AppLoading";
import { useAuth } from "@/auth/AuthContext";
import { getRequestId } from "@/utils/requestId";
import { recordRedirect } from "@/utils/redirectGuard";

export default function RequireAuth({ children }: { children: JSX.Element }) {
  const auth = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const requestId = getRequestId();

  useEffect(() => {
    if (!auth.authReady) return;
    if (!auth.authenticated) {
      console.info("RequireAuth redirect", {
        requestId,
        route: location.pathname,
        authState: auth.status,
        reason: "unauthenticated_redirect"
      });
      recordRedirect(location.pathname, "unauthenticated", location.key);
      navigate("/login", { replace: true });
    }
  }, [auth.authReady, auth.authenticated, auth.status, location.key, location.pathname, navigate, requestId]);

  if (!auth.authReady) {
    return <AppLoading />;
  }

  if (!auth.authenticated) {
    return <AppLoading />;
  }

  return children;
}
