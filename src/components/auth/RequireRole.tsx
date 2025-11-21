import { ReactNode } from "react";
import { useAuthStore } from "@/lib/auth/useAuthStore";

export function RequireRole({ roles, children }: { roles: string[]; children: ReactNode }) {
  const role = useAuthStore((s) => s.user?.role);
  if (!role || !roles.includes(role)) return null;
  return <>{children}</>;
}

export default RequireRole;
