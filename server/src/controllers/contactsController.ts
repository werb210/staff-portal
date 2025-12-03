import { Request, Response } from "express";
import contactsService from "../services/contactsService";

const contactsController = {
  list: async (_req: Request, res: Response) => {
    const data = await contactsService.list();
    res.json({ success: true, data });
  },

  get: async (req: Request, res: Response) => {
    const record = await contactsService.get(req.params.id);
    if (!record)
      return res.status(404).json({ success: false, error: "Not found" });
    res.json({ success: true, data: record });
  },

  create: async (req: Request, res: Response) => {
    const created = await contactsService.create(req.body ?? {});
    res.status(201).json({ success: true, data: created });
  },

  update: async (req: Request, res: Response) => {
    const updated = await contactsService.update(req.params.id, req.body ?? {});
    if (!updated)
      return res.status(404).json({ success: false, error: "Not found" });
    res.json({ success: true, data: updated });
  },

  remove: async (req: Request, res: Response) => {
    const removed = await contactsService.remove(req.params.id);
    if (!removed)
      return res.status(404).json({ success: false, error: "Not found" });
    res.json({ success: true, data: removed });
  },

  search: async (req: Request, res: Response) => {
    const q = (req.query.q as string) || "";
    const results = await contactsService.search(q);
    res.json({ success: true, data: results });
  },
};

export default contactsController;
