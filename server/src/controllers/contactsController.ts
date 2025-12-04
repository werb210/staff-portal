import { Request, Response } from "express";
import contactsService from "../services/contacts.service.js";

const contactsController = {
  async list(req: Request, res: Response) {
    const results = await contactsService.list();
    res.json({ ok: true, data: results });
  },

  async get(req: Request, res: Response) {
    const item = await contactsService.get(req.params.id);
    if (!item) {
      res.status(404).json({ ok: false, error: "Not found" });
      return;
    }
    res.json({ ok: true, data: item });
  },

  async create(req: Request, res: Response) {
    const created = await contactsService.create(req.body);
    res.json({ ok: true, data: created });
  },

  async update(req: Request, res: Response) {
    const updated = await contactsService.update(req.params.id, req.body);
    if (!updated) {
      res.status(404).json({ ok: false, error: "Not found" });
      return;
    }
    res.json({ ok: true, data: updated });
  },

  async remove(req: Request, res: Response) {
    const success = await contactsService.remove(req.params.id);
    res.json({ ok: true, deleted: success });
  },
};

export default contactsController;
