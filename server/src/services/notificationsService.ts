import notificationsRepo, { NotificationCreateInput } from "../db/repositories/notifications.repo.js";

function assertStr(x: any, label: string): string {
  if (!x || typeof x !== "string") throw new Error(`${label} is required`);
  return x;
}

export default {
  async listForUser(userId: string) {
    return notificationsRepo.listByUser(assertStr(userId, "userId"));
  },

  async unreadCount(userId: string) {
    return notificationsRepo.unreadCount(assertStr(userId, "userId"));
  },

  async markRead(id: string) {
    return notificationsRepo.markRead(assertStr(id, "id"));
  },

  async markAllRead(userId: string) {
    return notificationsRepo.markAllRead(assertStr(userId, "userId"));
  },

  async create(raw: any) {
    const payload: NotificationCreateInput = {
      userId: assertStr(raw.userId, "userId"),
      title: assertStr(raw.title, "title"),
      body: assertStr(raw.body, "body"),
      type: raw.type ?? null,
      relatedEntity: raw.relatedEntity ?? null,
      relatedId: raw.relatedId ?? null,
    };
    return notificationsRepo.create(payload);
  },

  async delete(id: string) {
    return notificationsRepo.delete(assertStr(id, "id"));
  },
};
