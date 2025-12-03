// server/src/controllers/companiesController.ts
import { Request, Response } from "express";
import CompaniesService from "../services/companiesService";

export const CompaniesController = {
  async list(req: Request, res: Response) {
    const results = await CompaniesService.list();
    res.json({ success: true, data: results });
  },

  async get(req: Request, res: Response) {
    const id = req.params.id;
    const record = await CompaniesService.get(id);
    if (!record) {
      return res.status(404).json({ success: false, error: "Company not found" });
    }
    res.json({ success: true, data: record });
  },

  async create(req: Request, res: Response) {
    const record = await CompaniesService.create(req.body);
    res.json({ success: true, data: record });
  },

  async update(req: Request, res: Response) {
    const id = req.params.id;
    const record = await CompaniesService.update(id, req.body);
    res.json({ success: true, data: record });
  },

  async delete(req: Request, res: Response) {
    const id = req.params.id;
    await CompaniesService.delete(id);
    res.json({ success: true });
  },
};

export default CompaniesController;
