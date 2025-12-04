import { Request, Response } from "express";
import notificationsService from "../services/notifications.service.js";

const notificationsController = {
  async listForUser(req: Request, res: Response) {
    const data = await notificationsService.listForUser(req.params.userId);
    res.json({ ok: true, data });
  },

  async listUnread(req: Request, res: Response) {
    const data = await notificationsService.listUnread(req.params.userId);
    res.json({ ok: true, data });
  },

  async create(req: Request, res: Response) {
    const row = await notificationsService.create(req.body);
    res.json({ ok: true, data: row });
  },

  async markRead(req: Request, res: Response) {
    const row = await notificationsService.markRead(req.params.id);
    res.json({ ok: true, data: row });
  },
};

export default notificationsController;
