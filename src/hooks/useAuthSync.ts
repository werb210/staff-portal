import { useEffect } from "react";

import http from "@/lib/http";
import { useAuthStore } from "@/store/useAuthStore";

export function useAuthSync() {
  useEffect(() => {
    const store = useAuthStore.getState();

    store.hydrate();

    if (!store.token) return;

    const syncProfile = async () => {
      try {
        const response = await http.get("/api/users/me");
        const { user, email, role } = response.data as {
          user?: Record<string, unknown>;
          email?: string;
          role?: string;
        };

        useAuthStore.setState((state) => ({
          token: state.token,
          role: role ?? user?.role?.toString() ?? state.role,
          email: email ?? user?.email?.toString() ?? state.email,
          user: user ?? state.user,
        }));
      } catch (error: unknown) {
        if ((error as { response?: { status?: number } }).response?.status === 401) {
          store.logout();
        }
      }
    };

    syncProfile();
  }, []);
}
