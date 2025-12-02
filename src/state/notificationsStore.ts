import { create } from "zustand";
import { fetchNotifications, markNotificationRead } from "../api/notifications";

interface Notification {
  id: string;
  title: string;
  message: string;
  createdAt: string;
  read: boolean;
}

interface NotificationState {
  items: Notification[];
  load(): Promise<void>;
  markRead(id: string): Promise<void>;
  addIncoming(n: Notification): void;
}

export const useNotificationsStore = create<NotificationState>((set, get) => ({
  items: [],

  async load() {
    try {
      const data = await fetchNotifications();
      set({ items: data });
    } catch {
      set({ items: [] });
    }
  },

  async markRead(id) {
    await markNotificationRead(id);
    set({
      items: get().items.map((x) => (x.id === id ? { ...x, read: true } : x)),
    });
  },

  addIncoming(n) {
    set({ items: [n, ...get().items] });
  },
}));
