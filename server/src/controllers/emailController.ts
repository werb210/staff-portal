import { Request, Response } from "express";
import { emailService } from "../services/emailService.js";

export const emailController = {
  async list(_req: Request, res: Response) {
    res.json(await emailService.list());
  },

  async get(req: Request, res: Response) {
    const { id } = req.params;
    const item = await emailService.get(id);
    if (!item) return res.status(404).json({ error: "Not found" });
    res.json(item);
  },

  async listByContact(req: Request, res: Response) {
    const { contactId } = req.params;
    res.json(await emailService.listByContact(contactId));
  },

  async send(req: Request, res: Response) {
    const { to, subject, html, text, contact_id } = req.body;

    if (!to || !subject) {
      return res.status(400).json({
        error: "to and subject are required",
      });
    }

    const result = await emailService.send({
      to,
      subject,
      html,
      text,
      contact_id,
    });

    res.json(result);
  },
};
