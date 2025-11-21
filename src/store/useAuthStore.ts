import { create } from "zustand";

const TOKEN_KEY = "staff_portal_token";

interface AuthState {
  token: string | null;
  user: any | null;
  isAuthenticated: boolean;
  setAuth: (token: string, user: any) => void;
  logout: () => void;
  hydrate: () => Promise<void>;
}

export type UserRole = "admin" | "staff" | "marketing" | "lender" | "referrer" | "user" | null;

export const useAuthStore = create<AuthState>((set) => {
  const setLoggedOut = () => {
    localStorage.removeItem(TOKEN_KEY);
    set({ token: null, user: null, isAuthenticated: false });
  };

  return {
    token: localStorage.getItem(TOKEN_KEY),
    user: null,
    isAuthenticated: Boolean(localStorage.getItem(TOKEN_KEY)),

    setAuth: (token, user) => {
      localStorage.setItem(TOKEN_KEY, token);
      set({ token, user: user ?? null, isAuthenticated: true });
    },

    logout: () => {
      setLoggedOut();
    },

    hydrate: async () => {
      const storedToken = localStorage.getItem(TOKEN_KEY);

      if (!storedToken) {
        setLoggedOut();
        return;
      }

      set({ token: storedToken, isAuthenticated: true });

      try {
        const { me } = await import("@/api/auth");
        const currentUser = await me();

        set({ user: currentUser ?? null, isAuthenticated: true });
      } catch (error) {
        setLoggedOut();
      }
    },
  };
});
