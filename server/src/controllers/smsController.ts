import { Request, Response } from "express";
import { smsService } from "../services/smsService.js";

export const smsController = {
  async list(_req: Request, res: Response) {
    res.json(await smsService.list());
  },

  async get(req: Request, res: Response) {
    const { id } = req.params;
    const item = await smsService.get(id);
    if (!item) return res.status(404).json({ error: "Not found" });
    res.json(item);
  },

  async listByContact(req: Request, res: Response) {
    const { contactId } = req.params;
    res.json(await smsService.listByContact(contactId));
  },

  async send(req: Request, res: Response) {
    const { to, body, contact_id } = req.body;

    if (!to || !body) {
      return res.status(400).json({
        error: "to and body are required",
      });
    }

    const result = await smsService.send({
      to,
      body,
      contact_id,
    });

    res.json(result);
  },
};
