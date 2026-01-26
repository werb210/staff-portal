import { create } from "zustand";
import type { NotificationItem } from "@/types/notifications";

const MAX_NOTIFICATIONS = 50;

type NotificationsState = {
  notifications: NotificationItem[];
  toast: NotificationItem | null;
  addNotification: (notification: NotificationItem) => void;
  markRead: (id: string) => void;
  markAllRead: () => void;
  clearAll: () => void;
  clearToast: () => void;
};

export const useNotificationsStore = create<NotificationsState>((set) => ({
  notifications: [],
  toast: null,
  addNotification: (notification) =>
    set((state) => {
      const nextNotifications = [notification, ...state.notifications].slice(0, MAX_NOTIFICATIONS);
      return {
        notifications: nextNotifications,
        toast: notification
      };
    }),
  markRead: (id) =>
    set((state) => ({
      notifications: state.notifications.map((item) =>
        item.id === id
          ? {
              ...item,
              read: true
            }
          : item
      )
    })),
  markAllRead: () =>
    set((state) => ({
      notifications: state.notifications.map((item) => ({ ...item, read: true }))
    })),
  clearAll: () => set({ notifications: [], toast: null }),
  clearToast: () => set({ toast: null })
}));
