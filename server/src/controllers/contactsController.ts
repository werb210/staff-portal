import { Request, Response } from "express";
import contactsService from "../services/contactsService";

const contactsController = {
  list: async (req: Request, res: Response) => {
    const filter = req.query ?? {};
    const data = await contactsService.findMany(filter);
    res.json({ success: true, data });
  },

  getById: async (req: Request, res: Response) => {
    const { id } = req.params;
    const data = await contactsService.findById(id);
    if (!data) return res.status(404).json({ success: false, error: "Not found" });
    res.json({ success: true, data });
  },

  create: async (req: Request, res: Response) => {
    const payload = req.body ?? {};
    const created = await contactsService.create(payload);
    res.status(201).json({ success: true, data: created });
  },

  update: async (req: Request, res: Response) => {
    const { id } = req.params;
    const payload = req.body ?? {};
    const updated = await contactsService.update(id, payload);

    if (!updated)
      return res.status(404).json({ success: false, error: "Not found" });

    res.json({ success: true, data: updated });
  },

  remove: async (req: Request, res: Response) => {
    const { id } = req.params;
    const deleted = await contactsService.delete(id);

    if (!deleted)
      return res.status(404).json({ success: false, error: "Not found" });

    res.json({ success: true, data: deleted });
  }
};

export default contactsController;
