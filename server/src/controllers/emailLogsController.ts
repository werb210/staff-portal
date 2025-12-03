import { Request, Response } from "express";
import { emailLogsService } from "../services/emailLogsService.js";

export const emailLogsController = {
  async list(_req: Request, res: Response) {
    const items = await emailLogsService.list();
    res.json(items);
  },

  async get(req: Request, res: Response) {
    const { id } = req.params;
    const item = await emailLogsService.get(id);
    if (!item) return res.status(404).json({ error: "Not found" });
    res.json(item);
  },

  async byContact(req: Request, res: Response) {
    const items = await emailLogsService.listByContact(req.params.contactId);
    res.json(items);
  },

  async byCompany(req: Request, res: Response) {
    const items = await emailLogsService.listByCompany(req.params.companyId);
    res.json(items);
  },

  async create(req: Request, res: Response) {
    const item = await emailLogsService.create(req.body);
    res.status(201).json(item);
  },
};
