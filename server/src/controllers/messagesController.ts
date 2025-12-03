import { Request, Response } from "express";
import messagesService from "../services/messagesService.js";

export default {
  async listForUser(req: Request, res: Response) {
    try {
      const items = await messagesService.listForUser(req.params.userId);
      res.json({ ok: true, items });
    } catch (e: any) {
      res.status(400).json({ ok: false, error: e.message });
    }
  },

  async listForApplication(req: Request, res: Response) {
    try {
      const items = await messagesService.listForApplication(req.params.applicationId);
      res.json({ ok: true, items });
    } catch (e: any) {
      res.status(400).json({ ok: false, error: e.message });
    }
  },

  async listForContact(req: Request, res: Response) {
    try {
      const items = await messagesService.listForContact(req.params.contactId);
      res.json({ ok: true, items });
    } catch (e: any) {
      res.status(400).json({ ok: false, error: e.message });
    }
  },

  async unread(req: Request, res: Response) {
    try {
      const count = await messagesService.unreadCount(req.params.userId);
      res.json({ ok: true, count });
    } catch (e: any) {
      res.status(400).json({ ok: false, error: e.message });
    }
  },

  async markRead(req: Request, res: Response) {
    try {
      const result = await messagesService.markRead(req.params.id);
      res.json({ ok: true, result });
    } catch (e: any) {
      res.status(400).json({ ok: false, error: e.message });
    }
  },

  async markThreadRead(req: Request, res: Response) {
    try {
      const result = await messagesService.markThreadRead(req.params.userId, req.params.contactId);
      res.json({ ok: true, result });
    } catch (e: any) {
      res.status(400).json({ ok: false, error: e.message });
    }
  },

  async create(req: Request, res: Response) {
    try {
      const msg = await messagesService.create(req.body);
      res.status(201).json({ ok: true, msg });
    } catch (e: any) {
      res.status(400).json({ ok: false, error: e.message });
    }
  },

  async delete(req: Request, res: Response) {
    try {
      const result = await messagesService.delete(req.params.id);
      res.json({ ok: true, result });
    } catch (e: any) {
      res.status(400).json({ ok: false, error: e.message });
    }
  },
};
