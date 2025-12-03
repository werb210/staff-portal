import { Request, Response } from "express";
import productsRepo from "../db/repositories/products.repo.js";
import asyncHandler from "../utils/asyncHandler.js";

const isDbConfigured = Boolean(process.env.DATABASE_URL);
const respondUnavailable = (res: Response) =>
  res.status(503).json({ success: false, error: "Database not configured" });
const respondEmpty = (res: Response) => res.json({ success: true, data: [] });

export const productsController = {
  list: asyncHandler(async (req: Request, res: Response) => {
    if (!isDbConfigured) return respondEmpty(res);
    const filter = {};
    if (req.query.lenderId) (filter as any).lenderId = req.query.lenderId;
    try {
      const data = await productsRepo.findMany(filter);
      res.json({ success: true, data });
    } catch (_err) {
      respondEmpty(res);
    }
  }),

  get: asyncHandler(async (req: Request, res: Response) => {
    if (!isDbConfigured) return respondUnavailable(res);
    try {
      const item = await productsRepo.findById(req.params.id);
      if (!item) return res.status(404).json({ success: false, error: "Product not found" });
      res.json({ success: true, data: item });
    } catch (_err) {
      respondUnavailable(res);
    }
  }),

  create: asyncHandler(async (req: Request, res: Response) => {
    if (!isDbConfigured) return respondUnavailable(res);
    try {
      const created = await productsRepo.create(req.body);
      res.status(201).json({ success: true, data: created });
    } catch (_err) {
      respondUnavailable(res);
    }
  }),

  update: asyncHandler(async (req: Request, res: Response) => {
    if (!isDbConfigured) return respondUnavailable(res);
    try {
      const updated = await productsRepo.update(req.params.id, req.body);
      if (!updated) return res.status(404).json({ success: false, error: "Product not found" });
      res.json({ success: true, data: updated });
    } catch (_err) {
      respondUnavailable(res);
    }
  }),

  remove: asyncHandler(async (req: Request, res: Response) => {
    if (!isDbConfigured) return respondUnavailable(res);
    try {
      const deleted = await productsRepo.delete(req.params.id);
      if (!deleted) return res.status(404).json({ success: false, error: "Product not found" });
      res.json({ success: true, data: deleted });
    } catch (_err) {
      respondUnavailable(res);
    }
  })
};

export default productsController;
