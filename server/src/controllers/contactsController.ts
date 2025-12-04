import { Request, Response } from "express";
import contactsService from "../services/contactsService";
import { auditService } from "../services/auditService.js";

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
    await auditService.log(
      req.user?.id ?? "system",
      "CREATE",
      "contact",
      String(created.id),
      created
    );
    res.status(201).json({ success: true, data: created });
  },

  update: async (req: Request, res: Response) => {
    const { id } = req.params;
    const updated = await contactsService.update(id, req.body ?? {});
    if (!updated)
      return res.status(404).json({ success: false, error: "Not found" });
    await auditService.log(
      req.user?.id ?? "system",
      "UPDATE",
      "contact",
      String(id),
      updated
    );
    res.json({ success: true, data: updated });
  },

  remove: async (req: Request, res: Response) => {
    const { id } = req.params;
    const removed = await contactsService.remove(id);
    if (!removed)
      return res.status(404).json({ success: false, error: "Not found" });
    await auditService.log(req.user?.id ?? "system", "DELETE", "contact", String(id));
    res.json({ success: true, data: removed });
  },

  search: async (req: Request, res: Response) => {
    const q = (req.query.q as string) || "";
    const results = await contactsService.search(q);
    res.json({ success: true, data: results });
  },
};

export default contactsController;
