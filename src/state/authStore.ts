import { create } from "zustand";
import { fetchCurrentUser } from "../api/auth";

interface AuthState {
  user: any | null;
  loading: boolean;
  loadUser: () => Promise<void>;
  setUser: (u: any | null) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  loading: true,

  loadUser: async () => {
    try {
      const data = await fetchCurrentUser();
      set({ user: data.user, loading: false });
    } catch {
      set({ user: null, loading: false });
    }
  },

  setUser: (u) => set({ user: u }),

  logout: () => {
    localStorage.removeItem("bf_token");
    set({ user: null });
  }
}));
