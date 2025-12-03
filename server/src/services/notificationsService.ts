import notificationsRepo, { NotificationCreateInput } from "../db/repositories/notifications.repo.js";
import { pushNotification } from "../realtime/socketServer.js";

function must(x: any, msg: string): string {
  if (!x || typeof x !== "string") throw new Error(msg);
  return x;
}

export default {
  async listForUser(userId: string) {
    return notificationsRepo.listForUser(must(userId, "userId required"));
  },

  async unreadCount(userId: string) {
    return notificationsRepo.unreadCount(must(userId, "userId required"));
  },

  async markRead(id: string) {
    return notificationsRepo.markRead(must(id, "notificationId required"));
  },

  async markAllRead(userId: string) {
    return notificationsRepo.markAllRead(must(userId, "userId required"));
  },

  async create(raw: any) {
    const payload: NotificationCreateInput = {
      userId: must(raw.userId, "userId required"),
      type: must(raw.type ?? "general", "type required"),
      title: must(raw.title, "title required"),
      body: must(raw.body, "body required"),
      applicationId: raw.applicationId ?? null,
      contactId: raw.contactId ?? null,
      relatedEntity: raw.relatedEntity ?? null,
      relatedId: raw.relatedId ?? null,
      read: raw.read ?? false,
    };
    const saved = await notificationsRepo.create(payload);
    pushNotification(saved.userId, { event: "notification", data: saved });
    return saved;
  },

  async delete(id: string) {
    return notificationsRepo.delete(must(id, "id required"));
  },
};
