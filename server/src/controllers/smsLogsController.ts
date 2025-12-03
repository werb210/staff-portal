import { Request, Response } from "express";
import smsLogsService from "../services/smsLogsService.js";

const smsLogsController = {
  async list(_req: Request, res: Response) {
    try {
      const items = await smsLogsService.list();
      res.json({ ok: true, items });
    } catch (err: any) {
      res.status(500).json({ ok: false, error: err.message });
    }
  },

  async get(req: Request, res: Response) {
    try {
      const item = await smsLogsService.get(req.params.id);
      res.json({ ok: true, item });
    } catch (err: any) {
      const status = err.message.includes("not found") ? 404 : 400;
      res.status(status).json({ ok: false, error: err.message });
    }
  },

  async byContact(req: Request, res: Response) {
    try {
      const items = await smsLogsService.listByContact(req.params.contactId);
      res.json({ ok: true, items });
    } catch (err: any) {
      res.status(400).json({ ok: false, error: err.message });
    }
  },

  async byCompany(req: Request, res: Response) {
    try {
      const items = await smsLogsService.listByCompany(req.params.companyId);
      res.json({ ok: true, items });
    } catch (err: any) {
      res.status(400).json({ ok: false, error: err.message });
    }
  },

  async byPhone(req: Request, res: Response) {
    try {
      const items = await smsLogsService.listByPhone(req.params.phone);
      res.json({ ok: true, items });
    } catch (err: any) {
      res.status(400).json({ ok: false, error: err.message });
    }
  },

  async create(req: Request, res: Response) {
    try {
      const item = await smsLogsService.create(req.body);
      res.status(201).json({ ok: true, item });
    } catch (err: any) {
      res.status(400).json({ ok: false, error: err.message });
    }
  },
};

export default smsLogsController;
