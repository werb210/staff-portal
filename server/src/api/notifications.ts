import { api } from "@/lib/http";

export interface Notification {
  id: string;
  type: string;
  message: string;
  read: boolean;
  createdAt: string;
}

export async function listNotifications() {
  const res = await api.get<Notification[]>("/notifications");
  return res.data;
}

export async function markRead(id: string) {
  const res = await api.post(`/notifications/${id}/read`, {});
  return res.data;
}
