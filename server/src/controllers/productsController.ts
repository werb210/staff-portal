import { Request, Response } from "express";
import productsRepo from "../db/repositories/products.repo.js";
import asyncHandler from "../utils/asyncHandler.js";

export const productsController = {
  list: asyncHandler(async (req: Request, res: Response) => {
    const filter = {};
    if (req.query.lenderId) (filter as any).lenderId = req.query.lenderId;
    const data = await productsRepo.findMany(filter);
    res.json({ success: true, data });
  }),

  get: asyncHandler(async (req: Request, res: Response) => {
    const item = await productsRepo.findById(req.params.id);
    if (!item) return res.status(404).json({ success: false, error: "Product not found" });
    res.json({ success: true, data: item });
  }),

  create: asyncHandler(async (req: Request, res: Response) => {
    const created = await productsRepo.create(req.body);
    res.status(201).json({ success: true, data: created });
  }),

  update: asyncHandler(async (req: Request, res: Response) => {
    const updated = await productsRepo.update(req.params.id, req.body);
    if (!updated) return res.status(404).json({ success: false, error: "Product not found" });
    res.json({ success: true, data: updated });
  }),

  remove: asyncHandler(async (req: Request, res: Response) => {
    const deleted = await productsRepo.delete(req.params.id);
    if (!deleted) return res.status(404).json({ success: false, error: "Product not found" });
    res.json({ success: true, data: deleted });
  })
};

export default productsController;
