import { create } from "zustand";

interface ToastItem {
  id: string;
  title: string;
  message: string;
}

interface ToastState {
  toasts: ToastItem[];
  push: (title: string, message: string) => void;
  remove: (id: string) => void;
}

export const useToastStore = create<ToastState>((set, get) => ({
  toasts: [],

  push: (title, message) => {
    const id = crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).slice(2);
    set({ toasts: [{ id, title, message }, ...get().toasts] });
    setTimeout(() => get().remove(id), 5000);
  },

  remove: (id) => set({ toasts: get().toasts.filter((t) => t.id !== id) }),
}));
