import { create } from "zustand";

interface ErrorStore {
  message: string | null;
  setError: (msg: string | null) => void;
}

export const useGlobalError = create<ErrorStore>((set) => ({
  message: null,
  setError: (msg) => set({ message: msg }),
}));
