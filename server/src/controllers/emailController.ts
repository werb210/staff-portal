import { Request, Response } from "express";
import { emailService } from "../services/emailService.js";

export const emailController = {
  async list(_req: Request, res: Response) {
    const items = await emailService.list();
    res.json(items);
  },

  async get(req: Request, res: Response) {
    const { id } = req.params;
    const item = await emailService.get(id);
    if (!item) return res.status(404).json({ error: "Not found" });
    res.json(item);
  },

  async listByContact(req: Request, res: Response) {
    const { contactId } = req.params;
    const items = await emailService.listByContact(contactId);
    res.json(items);
  },

  async send(req: Request, res: Response) {
    const { email, subject, body, contact_id } = req.body;

    if (!email || !subject || !body) {
      return res.status(400).json({ error: "email, subject, body are required" });
    }

    const sent = await emailService.send({
      email,
      subject,
      body,
      contact_id,
    });

    res.json(sent);
  },
};
