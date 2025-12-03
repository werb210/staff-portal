import { Request, Response } from "express";
import messagesService from "../services/messagesService.js";

export default {
  async list(_req: Request, res: Response) {
    try {
      const items = await messagesService.list();
      res.json({ ok: true, items });
    } catch (err: any) {
      res.status(500).json({ ok: false, error: err.message });
    }
  },

  async get(req: Request, res: Response) {
    try {
      const item = await messagesService.get(req.params.id);
      res.json({ ok: true, item });
    } catch (err: any) {
      const status = err.message.includes("not found") ? 404 : 400;
      res.status(status).json({ ok: false, error: err.message });
    }
  },

  async byContact(req: Request, res: Response) {
    try {
      const items = await messagesService.listByContact(req.params.contactId);
      res.json({ ok: true, items });
    } catch (err: any) {
      res.status(400).json({ ok: false, error: err.message });
    }
  },

  async byCompany(req: Request, res: Response) {
    try {
      const items = await messagesService.listByCompany(req.params.companyId);
      res.json({ ok: true, items });
    } catch (err: any) {
      res.status(400).json({ ok: false, error: err.message });
    }
  },

  async create(req: Request, res: Response) {
    try {
      const item = await messagesService.create(req.body);
      res.status(201).json({ ok: true, item });
    } catch (err: any) {
      res.status(400).json({ ok: false, error: err.message });
    }
  },

  async pin(req: Request, res: Response) {
    try {
      const item = await messagesService.pin(req.params.id);
      res.json({ ok: true, item });
    } catch (err: any) {
      res.status(400).json({ ok: false, error: err.message });
    }
  },

  async unpin(req: Request, res: Response) {
    try {
      const item = await messagesService.unpin(req.params.id);
      res.json({ ok: true, item });
    } catch (err: any) {
      res.status(400).json({ ok: false, error: err.message });
    }
  },
};
