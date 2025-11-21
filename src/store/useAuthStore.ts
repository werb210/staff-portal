import { create } from "zustand";

export type UserRole = string | null;

interface AuthState {
  token: string | null;
  role: string | null;
  email: string | null;
  user: Record<string, unknown> | null;
  login: (token: string, role: string, email: string, user: Record<string, unknown>) => void;
  logout: () => void;
  hydrate: () => void;
}

const TOKEN_KEY = "STAFF_TOKEN";
const ROLE_KEY = "STAFF_ROLE";
const EMAIL_KEY = "STAFF_EMAIL";
const USER_KEY = "STAFF_USER";

export const useAuthStore = create<AuthState>((set, get) => ({
  token: null,
  role: null,
  email: null,
  user: null,

  login: (token, role, email, user) => {
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(ROLE_KEY, role);
    localStorage.setItem(EMAIL_KEY, email);
    localStorage.setItem(USER_KEY, JSON.stringify(user));

    set({ token, role, email, user });
  },

  logout: () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(ROLE_KEY);
    localStorage.removeItem(EMAIL_KEY);
    localStorage.removeItem(USER_KEY);

    set({ token: null, role: null, email: null, user: null });
  },

  hydrate: () => {
    const token = localStorage.getItem(TOKEN_KEY);
    const role = localStorage.getItem(ROLE_KEY);
    const email = localStorage.getItem(EMAIL_KEY);
    const storedUser = localStorage.getItem(USER_KEY);

    let user: Record<string, unknown> | null = null;

    if (storedUser) {
      try {
        user = JSON.parse(storedUser);
      } catch (error) {
        console.warn("Failed to parse stored user", error);
        localStorage.removeItem(USER_KEY);
      }
    }

    if (!token) {
      get().logout();
      return;
    }

    set({ token, role, email, user });
  },
}));
