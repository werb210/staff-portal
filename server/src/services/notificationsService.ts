import { notificationsRepo } from "../db/repositories/notifications.repo.js";

export const notificationsService = {
  async create({
    userId,
    title,
    message,
    category = "general",
  }: {
    userId: string;
    title: string;
    message: string;
    category?: string;
  }) {
    return await notificationsRepo.create({
      userId,
      title,
      message,
      category,
    });
  },

  async forUser(userId: string) {
    return await notificationsRepo.list(userId);
  },

  async unread(userId: string) {
    return await notificationsRepo.unread(userId);
  },

  async markRead(id: string) {
    return await notificationsRepo.markRead(id);
  },

  async markAllRead(userId: string) {
    return await notificationsRepo.markAllRead(userId);
  },
};
