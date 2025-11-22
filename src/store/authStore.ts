import { create } from "zustand";

interface AuthState {
  token: string | null;
  user: any | null;
  role: string | null;

  setAuth: (token: string, user: any) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  token: localStorage.getItem("token"),
  user: null,
  role: localStorage.getItem("role"),

  setAuth: (token, user) => {
    localStorage.setItem("token", token);
    localStorage.setItem("role", user.role || "staff");

    set({ token, user, role: user.role || "staff" });
  },

  logout: () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    set({ token: null, user: null, role: null });
  }
}));
