// server/src/hooks/useAuthInit.ts
import { useEffect, useState } from "react";
import { apiRequest } from "../lib/http";

export function useAuthInit() {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    async function load() {
      const token = localStorage.getItem("bf_token");
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const me = await apiRequest("/auth/me");
        setUser(me);
      } catch {
        localStorage.removeItem("bf_token");
      }

      setLoading(false);
    }

    load();
  }, []);

  return { loading, user, setUser };
}
