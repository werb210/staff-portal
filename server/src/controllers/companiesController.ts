import { Request, Response } from "express";
import companiesRepo from "../db/repositories/companies.repo.js";
import asyncHandler from "../utils/asyncHandler.js";

export const companiesController = {
  list: asyncHandler(async (_req: Request, res: Response) => {
    const data = await companiesRepo.findMany();
    res.json({ success: true, data });
  }),

  get: asyncHandler(async (req: Request, res: Response) => {
    const company = await companiesRepo.findById(req.params.id);
    if (!company) return res.status(404).json({ success: false, error: "Company not found" });
    res.json({ success: true, data: company });
  }),

  create: asyncHandler(async (req: Request, res: Response) => {
    const created = await companiesRepo.create(req.body);
    res.status(201).json({ success: true, data: created });
  }),

  update: asyncHandler(async (req: Request, res: Response) => {
    const updated = await companiesRepo.update(req.params.id, req.body);
    if (!updated) return res.status(404).json({ success: false, error: "Company not found" });
    res.json({ success: true, data: updated });
  }),

  remove: asyncHandler(async (req: Request, res: Response) => {
    const deleted = await companiesRepo.delete(req.params.id);
    if (!deleted) return res.status(404).json({ success: false, error: "Company not found" });
    res.json({ success: true, data: deleted });
  })
};

export default companiesController;
