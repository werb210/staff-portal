import { Request, Response } from "express";
import companiesService from "../services/companies.service.js";

const companiesController = {
  async list(req: Request, res: Response) {
    const rows = await companiesService.list();
    res.json({ ok: true, data: rows });
  },

  async get(req: Request, res: Response) {
    const row = await companiesService.get(req.params.id);
    if (!row) {
      res.status(404).json({ ok: false, error: "Not found" });
      return;
    }
    res.json({ ok: true, data: row });
  },

  async create(req: Request, res: Response) {
    const created = await companiesService.create(req.body);
    res.json({ ok: true, data: created });
  },

  async update(req: Request, res: Response) {
    const updated = await companiesService.update(req.params.id, req.body);
    if (!updated) {
      res.status(404).json({ ok: false, error: "Not found" });
      return;
    }
    res.json({ ok: true, data: updated });
  },

  async remove(req: Request, res: Response) {
    const deleted = await companiesService.remove(req.params.id);
    res.json({ ok: true, deleted });
  },
};

export default companiesController;
