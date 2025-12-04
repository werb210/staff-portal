import { Request, Response } from "express";
import { notificationsService } from "../services/notificationsService.js";

export const notificationsController = {
  async list(req: Request, res: Response) {
    const { userId } = req.params;
    const data = await notificationsService.list(userId);
    return res.json({ success: true, data });
  },

  async create(req: Request, res: Response) {
    const { userId, title, message, category } = req.body;

    if (!userId || !title || !message) {
      return res.status(400).json({
        success: false,
        error: "userId, title, and message are required",
      });
    }

    const row = await notificationsService.create({
      userId,
      title,
      message,
      category: category || null,
    });

    return res.status(201).json({ success: true, data: row });
  },

  async read(req: Request, res: Response) {
    const { id } = req.params;
    const row = await notificationsService.markRead(id);
    return res.json({ success: true, data: row });
  },

  async unread(req: Request, res: Response) {
    const { userId } = req.params;
    const count = await notificationsService.unreadCount(userId);
    return res.json({ success: true, data: count });
  },

  async notifyAdmins(req: Request, res: Response) {
    const { title, message, category } = req.body;

    if (!title || !message) {
      return res.status(400).json({
        success: false,
        error: "title and message are required",
      });
    }

    const rows = await notificationsService.notifyAdmins(
      title,
      message,
      category || null
    );
    return res.json({ success: true, data: rows });
  },
};
