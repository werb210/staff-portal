import { notificationsRepo } from "../db/repositories/notifications.repo.js";
import { usersRepo } from "../db/repositories/users.repo.js";

export const notificationsService = {
  async create({
    userId,
    title,
    message,
    category,
  }: {
    userId: string;
    title: string;
    message: string;
    category?: string | null;
  }) {
    return await notificationsRepo.create({
      userId,
      title,
      message,
      category: category || null,
    });
  },

  async list(userId: string) {
    return await notificationsRepo.allForUser(userId);
  },

  async markRead(id: string) {
    return await notificationsRepo.markRead(id);
  },

  async unreadCount(userId: string) {
    return await notificationsRepo.unreadCount(userId);
  },

  async notifyAdmins(title: string, message: string, category?: string) {
    const admins = await usersRepo.allByRole("admin");
    const created = [];
    for (const admin of admins) {
      const n = await notificationsRepo.create({
        userId: admin.id,
        title,
        message,
        category: category || null,
      });
      created.push(n);
    }
    return created;
  },
};
