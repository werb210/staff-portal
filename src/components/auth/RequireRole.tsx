import { ReactNode } from "react";
import { useSessionStore } from "@/store/sessionStore";

export function RequireRole({ roles, children }: { roles: string[]; children: ReactNode }) {
  const role = useSessionStore((s) => s.role);
  if (!role || !roles.includes(role)) return null;
  return <>{children}</>;
}

export default RequireRole;
