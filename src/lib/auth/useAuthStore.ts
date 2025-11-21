import { create } from "zustand";

export const TOKEN_STORAGE_KEY = "bf_token";
export const USER_STORAGE_KEY = "auth_user";

type User = {
  id: string;
  email: string;
  role: string;
};

type AuthState = {
  token: string | null;
  user: User | null;

  setAuth: (t: string, u: User) => void;
  logout: () => void;
};

export const useAuthStore = create<AuthState>((set) => ({
  token: null,
  user: null,

  setAuth: (token, user) => {
    set({ token, user });
    localStorage.setItem(TOKEN_STORAGE_KEY, token);
    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
  },

  logout: () => {
    set({ token: null, user: null });
    localStorage.removeItem(TOKEN_STORAGE_KEY);
    localStorage.removeItem(USER_STORAGE_KEY);
  },
}));

// Auto-load from storage on startup
export const restoreAuth = () => {
  const t = localStorage.getItem(TOKEN_STORAGE_KEY);
  const u = localStorage.getItem(USER_STORAGE_KEY);

  if (t && u) {
    try {
      useAuthStore.getState().setAuth(t, JSON.parse(u));
    } catch (error) {
      console.error("Failed to restore auth", error);
      useAuthStore.getState().logout();
    }
  }
};
