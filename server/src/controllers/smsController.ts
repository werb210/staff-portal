import { Request, Response } from "express";
import { smsService } from "../services/smsService.js";

export const smsController = {
  async list(_req: Request, res: Response) {
    const items = await smsService.list();
    res.json(items);
  },

  async get(req: Request, res: Response) {
    const { id } = req.params;
    const item = await smsService.get(id);
    if (!item) return res.status(404).json({ error: "Not found" });
    res.json(item);
  },

  async listByContact(req: Request, res: Response) {
    const { contactId } = req.params;
    const items = await smsService.listByContact(contactId);
    res.json(items);
  },

  async send(req: Request, res: Response) {
    const { phone, message, contact_id } = req.body;

    if (!phone || !message) {
      return res.status(400).json({ error: "phone and message are required" });
    }

    const result = await smsService.send({
      phone,
      message,
      contact_id,
    });

    res.json(result);
  },
};
