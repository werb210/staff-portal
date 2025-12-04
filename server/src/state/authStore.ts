import { create } from "zustand";
import { User } from "@/types/User";
import { loginRequest } from "@/lib/api/auth";
import { clearAuth, loadAuth, saveAuth } from "@/utils/storage";

interface AuthState {
  user: User | null;
  token: string | null;
  loading: boolean;
  isHydrated: boolean;
  login: (args: { email: string; password: string }) => Promise<void>;
  logout: () => void;
  hydrate: () => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  token: null,
  loading: false,
  isHydrated: false,

  hydrate: () => {
    const { token, user } = loadAuth();
    set({ token, user, isHydrated: true });
  },

  login: async ({ email, password }) => {
    set({ loading: true });
    try {
      const { token, user } = await loginRequest(email, password);
      saveAuth(token, user);
      set({ token, user, loading: false, isHydrated: true });
    } catch (err) {
      set({ loading: false });
      throw err;
    }
  },

  logout: () => {
    clearAuth();
    set({ token: null, user: null });
  }
}));
