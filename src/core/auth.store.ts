import { create } from "zustand";

interface AuthState {
  accessToken: string | null;
  refreshToken: string | null;
  setTokens: (tokens: { accessToken: string; refreshToken?: string | null }) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  accessToken: null,
  refreshToken: null,
  setTokens: ({ accessToken, refreshToken = null }) => set({ accessToken, refreshToken }),
  logout: () => set({ accessToken: null, refreshToken: null }),
}));

export const getAuthState = () => useAuthStore.getState();
