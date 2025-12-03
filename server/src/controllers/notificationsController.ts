import { Request, Response } from "express";
import { notificationsRepo } from "../db/repositories/notifications.repo.js";

export const notificationsController = {
  getForUser: async (req: Request, res: Response) => {
    const userId = req.params.userId;
    const list = await notificationsRepo.findForUser(userId);
    res.json({ success: true, data: list });
  },

  create: async (req: Request, res: Response) => {
    const { userId, title, message } = req.body;

    if (!userId || !title || !message) {
      return res.status(400).json({
        success: false,
        error: "Missing fields (userId, title, message required)",
      });
    }

    const created = await notificationsRepo.create({ userId, title, message });
    res.status(201).json({ success: true, data: created });
  },

  markRead: async (req: Request, res: Response) => {
    const id = Number(req.params.id);
    const updated = await notificationsRepo.markRead(id);

    if (!updated)
      return res.status(404).json({ success: false, error: "Notification not found" });

    res.json({ success: true, data: updated });
  },

  delete: async (req: Request, res: Response) => {
    const id = Number(req.params.id);
    const deleted = await notificationsRepo.delete(id);

    if (!deleted)
      return res.status(404).json({ success: false, error: "Notification not found" });

    res.json({ success: true });
  },
};
