// LEGACY AUTH — DO NOT USE
// Replaced by unified auth system in src/lib/auth/
import { useEffect } from "react";
import { useAuthStore } from "../store/auth";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const initialize = useAuthStore((state) => state.initialize);

  useEffect(() => {
    initialize();
  }, [initialize]);

  return <>{children}</>;
}
