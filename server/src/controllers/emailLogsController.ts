import { Request, Response } from "express";
import { emailLogsService } from "../services/emailLogsService.js";

export const emailLogsController = {
  async list(_req: Request, res: Response) {
    res.json(await emailLogsService.list());
  },

  async get(req: Request, res: Response) {
    const { id } = req.params;
    const item = await emailLogsService.get(id);
    if (!item) return res.status(404).json({ error: "Not found" });
    res.json(item);
  },

  async listByContact(req: Request, res: Response) {
    const { contactId } = req.params;
    res.json(await emailLogsService.listByContact(contactId));
  },

  async create(req: Request, res: Response) {
    const created = await emailLogsService.create(req.body);
    res.json(created);
  },
};
