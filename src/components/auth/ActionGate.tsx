import type { ReactNode } from "react";
import type { UserRole } from "@/utils/roles";
import type { Capability } from "@/utils/permissions";
import { useAuthorization } from "@/hooks/useAuthorization";

type ActionGateProps = {
  roles?: UserRole[];
  capabilities?: Capability[];
  fallback?: ReactNode;
  children: ReactNode;
};

const ActionGate = ({ roles = [], capabilities = [], fallback = null, children }: ActionGateProps) => {
  const allowed = useAuthorization({ roles, capabilities });

  if (!allowed) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
};

export default ActionGate;
