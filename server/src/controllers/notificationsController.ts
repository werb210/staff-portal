import asyncHandler from "../utils/asyncHandler.js";
import { notificationsRepo } from "../db/repositories/notifications.repo.js";

export const notificationsController = {
  list: asyncHandler(async (req: any, res) => {
    const userId = req.user.id;
    const list = await notificationsRepo.listForUser(userId);
    res.json({ success: true, data: list });
  }),

  markRead: asyncHandler(async (req: any, res) => {
    const userId = req.user.id;
    const { id } = req.params;
    const updated = await notificationsRepo.markRead(id, userId);
    res.json({ success: true, data: updated });
  }),
};
