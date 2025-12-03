import { Request, Response } from "express";
import { emailService } from "../services/emailService.js";

export const emailController = {
  async list(_req: Request, res: Response) {
    res.json(await emailService.list());
  },

  async get(req: Request, res: Response) {
    const { id } = req.params;
    const result = await emailService.get(id);
    if (!result) return res.status(404).json({ error: "Not found" });
    res.json(result);
  },

  async listByContact(req: Request, res: Response) {
    const { contactId } = req.params;
    res.json(await emailService.listByContact(contactId));
  },

  async send(req: Request, res: Response) {
    const { to, subject, body, contact_id } = req.body;

    if (!to || !subject || !body) {
      return res.status(400).json({
        error: "to, subject, and body are required",
      });
    }

    const result = await emailService.send({
      to,
      subject,
      body,
      contact_id,
    });

    res.json(result);
  },
};
