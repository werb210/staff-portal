// server/src/hooks/useAuthInit.ts
import { useEffect } from "react";
import { useAuthStore } from "@/state/authStore";
import { setAuthToken } from "@/lib/http";

export function useAuthInit() {
  const token = useAuthStore((s) => s.token);

  useEffect(() => {
    setAuthToken(token ?? null);
  }, [token]);
}
