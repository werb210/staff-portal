import { Request, Response } from "express";
import companiesRepo from "../db/repositories/companies.repo.js";
import asyncHandler from "../utils/asyncHandler.js";

const isDbConfigured = Boolean(process.env.DATABASE_URL);
const respondUnavailable = (res: Response) =>
  res.status(503).json({ success: false, error: "Database not configured" });
const respondEmpty = (res: Response) => res.json({ success: true, data: [] });

export const companiesController = {
  list: asyncHandler(async (_req: Request, res: Response) => {
    if (!isDbConfigured) return respondEmpty(res);
    try {
      const data = await companiesRepo.findMany();
      res.json({ success: true, data });
    } catch (_err) {
      respondEmpty(res);
    }
  }),

  get: asyncHandler(async (req: Request, res: Response) => {
    if (!isDbConfigured) return respondUnavailable(res);
    try {
      const company = await companiesRepo.findById(req.params.id);
      if (!company) return res.status(404).json({ success: false, error: "Company not found" });
      res.json({ success: true, data: company });
    } catch (_err) {
      respondUnavailable(res);
    }
  }),

  create: asyncHandler(async (req: Request, res: Response) => {
    if (!isDbConfigured) return respondUnavailable(res);
    try {
      const created = await companiesRepo.create(req.body);
      res.status(201).json({ success: true, data: created });
    } catch (_err) {
      respondUnavailable(res);
    }
  }),

  update: asyncHandler(async (req: Request, res: Response) => {
    if (!isDbConfigured) return respondUnavailable(res);
    try {
      const updated = await companiesRepo.update(req.params.id, req.body);
      if (!updated) return res.status(404).json({ success: false, error: "Company not found" });
      res.json({ success: true, data: updated });
    } catch (_err) {
      respondUnavailable(res);
    }
  }),

  remove: asyncHandler(async (req: Request, res: Response) => {
    if (!isDbConfigured) return respondUnavailable(res);
    try {
      const deleted = await companiesRepo.delete(req.params.id);
      if (!deleted) return res.status(404).json({ success: false, error: "Company not found" });
      res.json({ success: true, data: deleted });
    } catch (_err) {
      respondUnavailable(res);
    }
  })
};

export default companiesController;
