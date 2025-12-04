import { useEffect } from "react";
import { authStore } from "@/state/authStore";
import { me } from "@/api/auth";

export function useAuthInit() {
  useEffect(() => {
    async function load() {
      try {
        const user = await me();
        authStore.setState({ user, isAuthenticated: true, loading: false });
      } catch {
        authStore.setState({ user: null, isAuthenticated: false, loading: false });
      }
    }
    load();
  }, []);
}
