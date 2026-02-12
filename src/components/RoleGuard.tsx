import { type ReactNode } from "react";
import { useAuth } from "@/hooks/useAuth";

export function RoleGuard({ role, children }: { role: string; children: ReactNode }) {
  const { user } = useAuth();

  if (!user) return null;
  if (user.role !== role) return null;

  return <>{children}</>;
}
