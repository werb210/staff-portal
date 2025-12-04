import { Request, Response } from "express";
import messagesService from "../services/messages.service.js";

const messagesController = {
  async listApplication(req: Request, res: Response) {
    const rows = await messagesService.listForApplication(req.params.applicationId);
    res.json({ ok: true, data: rows });
  },

  async listContact(req: Request, res: Response) {
    const rows = await messagesService.listForContact(req.params.contactId);
    res.json({ ok: true, data: rows });
  },

  async create(req: Request, res: Response) {
    const created = await messagesService.create(req.body);
    res.json({ ok: true, data: created });
  },
};

export default messagesController;
