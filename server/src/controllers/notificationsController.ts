import { Request, Response } from "express";
import { notificationsService } from "../services/notificationsService.js";

export const notificationsController = {
  async list(req: Request, res: Response) {
    const { userId } = req.params;
    const data = await notificationsService.forUser(userId);
    return res.json({ success: true, data });
  },

  async unread(req: Request, res: Response) {
    const { userId } = req.params;
    const data = await notificationsService.unread(userId);
    return res.json({ success: true, data });
  },

  async markRead(req: Request, res: Response) {
    const { id } = req.params;
    const data = await notificationsService.markRead(id);
    return res.json({ success: true, data });
  },

  async markAll(req: Request, res: Response) {
    const { userId } = req.params;
    await notificationsService.markAllRead(userId);
    return res.json({ success: true });
  },
};
