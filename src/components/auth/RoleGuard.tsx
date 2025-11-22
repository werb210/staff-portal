import { PropsWithChildren, useEffect, useMemo, useRef } from "react";
import { Navigate, useLocation } from "react-router-dom";

import { useAuthStore } from "../../core/auth.store";

interface RoleGuardProps extends PropsWithChildren {
  allowedRoles: string[];
}

export function RoleGuard({ allowedRoles, children }: RoleGuardProps) {
  const role = useAuthStore((state) => state.role);
  const location = useLocation();
  const hasAccess = useMemo(() => Boolean(role && allowedRoles.includes(role)), [allowedRoles, role]);
  const toastShownRef = useRef(false);

  useEffect(() => {
    if (!hasAccess && !toastShownRef.current) {
      toastShownRef.current = true;
      if (typeof window !== "undefined") {
        window.alert("Not authorized");
      }
    }
  }, [hasAccess]);

  if (!hasAccess) {
    const from = `${location.pathname}${location.search}`;
    return <Navigate to="/dashboard" state={{ from }} replace />;
  }

  return <>{children}</>;
}
