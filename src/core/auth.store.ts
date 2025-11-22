import { create } from "zustand";

import queryClient from "./queryClient";

const TOKEN_STORAGE_KEY = "staff-portal-tokens";

interface AuthState {
  accessToken: string | null;
  refreshToken: string | null;
  role: string | null;
  setTokens: (tokens: { accessToken: string; refreshToken?: string | null; role?: string | null }) => void;
  setRole: (role: string | null) => void;
  logout: () => void;
}

const loadStoredTokens = () => {
  if (typeof window === "undefined") {
    return { accessToken: null, refreshToken: null, role: null };
  }

  try {
    const raw = window.localStorage.getItem(TOKEN_STORAGE_KEY);

    if (!raw) return { accessToken: null, refreshToken: null, role: null };

    const parsed = JSON.parse(raw);

    return {
      accessToken: parsed?.accessToken ?? null,
      refreshToken: parsed?.refreshToken ?? null,
      role: parsed?.role ?? null,
    };
  } catch (error) {
    console.error("Failed to parse stored tokens", error);
    return { accessToken: null, refreshToken: null, role: null };
  }
};

const persistTokens = (tokens: { accessToken: string; refreshToken?: string | null; role?: string | null }) => {
  if (typeof window === "undefined") return;

  window.localStorage.setItem(
    TOKEN_STORAGE_KEY,
    JSON.stringify({
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken ?? null,
      role: tokens.role ?? null,
    }),
  );
};

const clearPersistedTokens = () => {
  if (typeof window === "undefined") return;

  window.localStorage.removeItem(TOKEN_STORAGE_KEY);
};

export const useAuthStore = create<AuthState>((set) => ({
  ...loadStoredTokens(),
  setTokens: ({ accessToken, refreshToken = null, role = null }) => {
    persistTokens({ accessToken, refreshToken, role });
    set({ accessToken, refreshToken, role });
  },
  setRole: (role) => set((state) => ({ ...state, role })),
  logout: () => {
    clearPersistedTokens();
    queryClient.clear();
    set({ accessToken: null, refreshToken: null, role: null });
  },
}));

export const getAuthState = () => useAuthStore.getState();
