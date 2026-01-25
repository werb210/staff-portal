import { ReactNode } from "react";
import { useAuth } from "../hooks/useAuth";

export function RequireRole({ allow, children }: { allow: string[]; children: ReactNode }) {
  const { user } = useAuth();
  if (!user || !allow.includes(user.role ?? "")) {
    return <div role="alert">Access denied</div>;
  }
  return <>{children}</>;
}
