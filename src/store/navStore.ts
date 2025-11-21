import { create } from "zustand";

interface NavState {
  open: boolean;
  toggle: () => void;
  setOpen: (open: boolean) => void;
}

export const useNavStore = create<NavState>((set) => ({
  open: false,
  toggle: () => set((state) => ({ open: !state.open })),
  setOpen: (open) => set({ open }),
}));
