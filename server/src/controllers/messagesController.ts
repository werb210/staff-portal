import { Request, Response } from "express";
import { messagesService } from "../services/messagesService.js";

export const messagesController = {
  async list(_req: Request, res: Response) {
    res.json(await messagesService.list());
  },

  async get(req: Request, res: Response) {
    const { id } = req.params;
    const msg = await messagesService.get(id);
    if (!msg) return res.status(404).json({ error: "Not found" });
    res.json(msg);
  },

  async listByContact(req: Request, res: Response) {
    const { contactId } = req.params;
    res.json(await messagesService.listByContact(contactId));
  },

  async create(req: Request, res: Response) {
    const created = await messagesService.create(req.body);
    res.json(created);
  },

  async remove(req: Request, res: Response) {
    const { id } = req.params;
    await messagesService.remove(id);
    res.json({ success: true });
  },
};
