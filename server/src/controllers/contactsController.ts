import { Request, Response } from "express";
import { contactsService } from "../services/contactsService.js";

export const contactsController = {
  async list(_req: Request, res: Response) {
    res.json(await contactsService.list());
  },

  async get(req: Request, res: Response) {
    const { id } = req.params;
    const item = await contactsService.get(id);
    if (!item) return res.status(404).json({ error: "Not found" });
    res.json(item);
  },

  async create(req: Request, res: Response) {
    const created = await contactsService.create(req.body);
    res.json(created);
  },

  async update(req: Request, res: Response) {
    const { id } = req.params;
    const updated = await contactsService.update(id, req.body);
    res.json(updated);
  },

  async remove(req: Request, res: Response) {
    const { id } = req.params;
    await contactsService.remove(id);
    res.json({ success: true });
  }
};
