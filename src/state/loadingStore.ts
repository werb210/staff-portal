import { create } from "zustand";

type LoadingState = {
  loading: boolean;
  show: () => void;
  hide: () => void;
};

export const useGlobalLoading = create<LoadingState>((set) => ({
  loading: false,
  show: () => set({ loading: true }),
  hide: () => set({ loading: false }),
}));
