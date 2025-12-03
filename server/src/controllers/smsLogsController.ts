import { Request, Response } from "express";
import { smsLogsService } from "../services/smsLogsService.js";

export const smsLogsController = {
  async list(_req: Request, res: Response) {
    const items = await smsLogsService.list();
    res.json(items);
  },

  async get(req: Request, res: Response) {
    const { id } = req.params;
    const item = await smsLogsService.get(id);
    if (!item) return res.status(404).json({ error: "Not found" });
    res.json(item);
  },

  async listByContact(req: Request, res: Response) {
    const { contactId } = req.params;
    const items = await smsLogsService.listByContact(contactId);
    res.json(items);
  },

  async create(req: Request, res: Response) {
    const created = await smsLogsService.create(req.body);
    res.status(201).json(created);
  },
};
