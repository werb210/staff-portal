import notificationsRepo from "../db/repositories/notifications.repo.js";
import timelineRepo from "../db/repositories/timeline.repo.js";

const notificationsService = {
  async listForUser(userId: string) {
    return notificationsRepo.listForUser(userId);
  },

  async listUnread(userId: string) {
    return notificationsRepo.listUnread(userId);
  },

  async create(payload: any) {
    const created = await notificationsRepo.create({
      userId: payload.userId ?? null,
      type: payload.type ?? "general",
      message: payload.message ?? "",
    });

    // also write timeline entry if tied to app
    if (payload.applicationId) {
      await timelineRepo.create({
        applicationId: payload.applicationId,
        type: "notification",
        description: `Notification: ${payload.message}`,
      });
    }

    return created;
  },

  async markRead(id: string) {
    return notificationsRepo.markRead(id);
  },
};

export default notificationsService;
