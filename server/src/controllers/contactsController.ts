import { Request, Response } from "express";
import contactsRepo from "../db/repositories/contacts.repo.js";
import asyncHandler from "../utils/asyncHandler.js";

export const contactsController = {
  list: asyncHandler(async (req: Request, res: Response) => {
    const filter = {};
    if (req.query.companyId) (filter as any).companyId = req.query.companyId;
    const data = await contactsRepo.findMany(filter);
    res.json({ success: true, data });
  }),

  get: asyncHandler(async (req: Request, res: Response) => {
    const item = await contactsRepo.findById(req.params.id);
    if (!item) return res.status(404).json({ success: false, error: "Contact not found" });
    res.json({ success: true, data: item });
  }),

  create: asyncHandler(async (req: Request, res: Response) => {
    const created = await contactsRepo.create(req.body);
    res.status(201).json({ success: true, data: created });
  }),

  update: asyncHandler(async (req: Request, res: Response) => {
    const updated = await contactsRepo.update(req.params.id, req.body);
    if (!updated) return res.status(404).json({ success: false, error: "Contact not found" });
    res.json({ success: true, data: updated });
  }),

  remove: asyncHandler(async (req: Request, res: Response) => {
    const deleted = await contactsRepo.delete(req.params.id);
    if (!deleted) return res.status(404).json({ success: false, error: "Contact not found" });
    res.json({ success: true, data: deleted });
  })
};

export default contactsController;
