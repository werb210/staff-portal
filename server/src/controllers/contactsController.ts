import { Request, Response } from "express";
import contactsRepo from "../db/repositories/contacts.repo.js";
import asyncHandler from "../utils/asyncHandler.js";

const isDbConfigured = Boolean(process.env.DATABASE_URL);
const respondUnavailable = (res: Response) =>
  res.status(503).json({ success: false, error: "Database not configured" });
const respondEmpty = (res: Response) => res.json({ success: true, data: [] });

export const contactsController = {
  list: asyncHandler(async (req: Request, res: Response) => {
    if (!isDbConfigured) return respondEmpty(res);
    const filter = {};
    if (req.query.companyId) (filter as any).companyId = req.query.companyId;
    try {
      const data = await contactsRepo.findMany(filter);
      res.json({ success: true, data });
    } catch (_err) {
      respondEmpty(res);
    }
  }),

  get: asyncHandler(async (req: Request, res: Response) => {
    if (!isDbConfigured) return respondUnavailable(res);
    try {
      const item = await contactsRepo.findById(req.params.id);
      if (!item) return res.status(404).json({ success: false, error: "Contact not found" });
      res.json({ success: true, data: item });
    } catch (_err) {
      respondUnavailable(res);
    }
  }),

  create: asyncHandler(async (req: Request, res: Response) => {
    if (!isDbConfigured) return respondUnavailable(res);
    try {
      const created = await contactsRepo.create(req.body);
      res.status(201).json({ success: true, data: created });
    } catch (_err) {
      respondUnavailable(res);
    }
  }),

  update: asyncHandler(async (req: Request, res: Response) => {
    if (!isDbConfigured) return respondUnavailable(res);
    try {
      const updated = await contactsRepo.update(req.params.id, req.body);
      if (!updated) return res.status(404).json({ success: false, error: "Contact not found" });
      res.json({ success: true, data: updated });
    } catch (_err) {
      respondUnavailable(res);
    }
  }),

  remove: asyncHandler(async (req: Request, res: Response) => {
    if (!isDbConfigured) return respondUnavailable(res);
    try {
      const deleted = await contactsRepo.delete(req.params.id);
      if (!deleted) return res.status(404).json({ success: false, error: "Contact not found" });
      res.json({ success: true, data: deleted });
    } catch (_err) {
      respondUnavailable(res);
    }
  })
};

export default contactsController;
