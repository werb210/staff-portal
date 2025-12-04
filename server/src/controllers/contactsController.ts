// server/src/controllers/contactsController.ts
import { Request, Response } from "express";
import contactsRepo from "../db/repositories/contacts.repo.js";

export default {
  list: async (_req: Request, res: Response) => {
    const data = await contactsRepo.findMany();
    res.json({ success: true, data });
  },

  create: async (req: Request, res: Response) => {
    const created = await contactsRepo.create(req.body || {});
    res.json({ success: true, data: created });
  },

  getById: async (req: Request, res: Response) => {
    const record = await contactsRepo.findById(req.params.id);
    if (!record) return res.status(404).json({ error: "Not found" });
    res.json({ success: true, data: record });
  },

  update: async (req: Request, res: Response) => {
    const updated = await contactsRepo.update(req.params.id, req.body || {});
    if (!updated) return res.status(404).json({ error: "Not found" });
    res.json({ success: true, data: updated });
  },

  remove: async (req: Request, res: Response) => {
    const deleted = await contactsRepo.delete(req.params.id);
    if (!deleted) return res.status(404).json({ error: "Not found" });
    res.json({ success: true, data: deleted });
  },
};
