import type { ReactNode } from "react";
import { useAuth } from "@/hooks/useAuth";
import { roleCapabilities } from "@/security/capabilityMap";

type CapabilityGuardProps = {
  capability: string;
  children: ReactNode;
};

export function CapabilityGuard({ capability, children }: CapabilityGuardProps) {
  const { user } = useAuth();
  const normalizedRole = (user?.role ?? "").toLowerCase();

  if (!roleCapabilities[normalizedRole]?.includes(capability)) {
    return null;
  }

  return <>{children}</>;
}
