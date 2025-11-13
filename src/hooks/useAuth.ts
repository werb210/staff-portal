// ======================================================================
// src/hooks/useAuth.ts
// Canonical Staff Portal authentication hook
// - Proper hydration
// - Stable status transitions
// - Profile fetch after token restored
// - Auto-clear on failure
// - No infinite loops
// ======================================================================

import { useEffect } from "react";
import { useAuthStore } from "../store/authStore";
import { authService } from "../services/authService";

export function useAuth() {
  const {
    user,
    token,
    status,
    hydrated,
    hydrate,
    setUser,
    setStatus,
    clear,
  } = useAuthStore();

  // -------------------------------------------------------------
  // 1) Initial hydration (restore token from storage)
  // -------------------------------------------------------------
  useEffect(() => {
    if (!hydrated && status === "idle") {
      hydrate(); // loads token into store if exists
    }
  }, [hydrate, hydrated, status]);

  // -------------------------------------------------------------
  // 2) After hydration, determine next step
  // -------------------------------------------------------------
  useEffect(() => {
    if (!hydrated) return;

    // If no token after hydration → unauthenticated
    if (!token) {
      if (status !== "unauthenticated") {
        setStatus("unauthenticated");
      }
      return;
    }

    // If we have a token but no profile → fetch it
    if (status === "idle" || status === "loading") {
      setStatus("loading");

      const loadProfile = async () => {
        try {
          const profile = await authService.fetchProfile();
          setUser(profile);
          setStatus("authenticated");
        } catch (err) {
          console.warn("Auth failed — clearing token", err);
          clear();
          setStatus("unauthenticated");
        }
      };

      void loadProfile();
    }
  }, [hydrated, token, status, setStatus, setUser, clear]);

  return { user, status, token };
}
