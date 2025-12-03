import { Request, Response } from "express";
import { notificationsService } from "../services/notificationsService.js";

export const notificationsController = {
  async list(_req: Request, res: Response) {
    res.json(await notificationsService.list());
  },

  async get(req: Request, res: Response) {
    const { id } = req.params;
    const item = await notificationsService.get(id);
    if (!item) return res.status(404).json({ error: "Not found" });
    res.json(item);
  },

  async listByContact(req: Request, res: Response) {
    const { contactId } = req.params;
    res.json(await notificationsService.listByContact(contactId));
  },

  async create(req: Request, res: Response) {
    const created = await notificationsService.create(req.body);
    res.json(created);
  },

  async markRead(req: Request, res: Response) {
    const { id } = req.params;
    await notificationsService.markRead(id);
    res.json({ success: true });
  },

  async remove(req: Request, res: Response) {
    const { id } = req.params;
    await notificationsService.remove(id);
    res.json({ success: true });
  },
};
