import { Request, Response } from "express";
import companiesService from "../services/companiesService";
import { auditService } from "../services/auditService.js";

const companiesController = {
  list: async (_req: Request, res: Response) => {
    const data = await companiesService.list();
    res.json({ success: true, data });
  },

  get: async (req: Request, res: Response) => {
    const record = await companiesService.get(req.params.id);
    if (!record)
      return res.status(404).json({ success: false, error: "Not found" });
    res.json({ success: true, data: record });
  },

  create: async (req: Request, res: Response) => {
    const created = await companiesService.create(req.body ?? {});
    await auditService.log(
      req.user?.id ?? "system",
      "CREATE",
      "company",
      String(created.id),
      created
    );
    res.status(201).json({ success: true, data: created });
  },

  update: async (req: Request, res: Response) => {
    const { id } = req.params;
    const updated = await companiesService.update(id, req.body ?? {});
    if (!updated)
      return res.status(404).json({ success: false, error: "Not found" });
    await auditService.log(
      req.user?.id ?? "system",
      "UPDATE",
      "company",
      String(id),
      updated
    );
    res.json({ success: true, data: updated });
  },

  remove: async (req: Request, res: Response) => {
    const { id } = req.params;
    const removed = await companiesService.remove(id);
    if (!removed)
      return res.status(404).json({ success: false, error: "Not found" });
    await auditService.log(req.user?.id ?? "system", "DELETE", "company", String(id));
    res.json({ success: true, data: removed });
  },

  search: async (req: Request, res: Response) => {
    const q = (req.query.q as string) || "";
    const results = await companiesService.search(q);
    res.json({ success: true, data: results });
  },

  contacts: async (req: Request, res: Response) => {
    const companyId = req.params.id;
    const data = await companiesService.getContacts(companyId);
    res.json({ success: true, data });
  },
};

export default companiesController;
