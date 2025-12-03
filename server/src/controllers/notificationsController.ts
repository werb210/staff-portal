import { Request, Response } from "express";
import notificationsService from "../services/notificationsService.js";

export default {
  async list(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.id;
      const items = await notificationsService.listForUser(userId);
      res.json({ ok: true, items });
    } catch (err: any) {
      res.status(400).json({ ok: false, error: err.message });
    }
  },

  async listForUser(req: Request, res: Response) {
    try {
      const items = await notificationsService.listForUser(req.params.userId);
      res.json({ ok: true, items });
    } catch (err: any) {
      res.status(400).json({ ok: false, error: err.message });
    }
  },

  async unread(req: Request, res: Response) {
    try {
      const count = await notificationsService.unreadCount(req.params.userId);
      res.json({ ok: true, count });
    } catch (err: any) {
      res.status(400).json({ ok: false, error: err.message });
    }
  },

  async unreadForCurrent(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.id;
      const count = await notificationsService.unreadCount(userId);
      res.json({ ok: true, count });
    } catch (err: any) {
      res.status(400).json({ ok: false, error: err.message });
    }
  },

  async markRead(req: Request, res: Response) {
    try {
      const item = await notificationsService.markRead(req.params.id);
      res.json({ ok: true, item });
    } catch (err: any) {
      res.status(400).json({ ok: false, error: err.message });
    }
  },

  async markAllRead(req: Request, res: Response) {
    try {
      const result = await notificationsService.markAllRead(req.params.userId);
      res.json({ ok: true, result });
    } catch (err: any) {
      res.status(400).json({ ok: false, error: err.message });
    }
  },

  async markAllReadForCurrent(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.id;
      const result = await notificationsService.markAllRead(userId);
      res.json({ ok: true, result });
    } catch (err: any) {
      res.status(400).json({ ok: false, error: err.message });
    }
  },

  async create(req: Request, res: Response) {
    try {
      const item = await notificationsService.create(req.body);
      res.status(201).json({ ok: true, item });
    } catch (err: any) {
      res.status(400).json({ ok: false, error: err.message });
    }
  },

  async delete(req: Request, res: Response) {
    try {
      const item = await notificationsService.delete(req.params.id);
      res.json({ ok: true, item });
    } catch (err: any) {
      res.status(400).json({ ok: false, error: err.message });
    }
  },
};
