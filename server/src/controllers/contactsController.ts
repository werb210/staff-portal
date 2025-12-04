// server/src/controllers/contactsController.ts
import { Request, Response } from "express";
import asyncHandler from "../utils/asyncHandler.js";
import contactsService from "../services/contactsService.js";

export const contactsController = {
  list: asyncHandler(async (_req: Request, res: Response) => {
    const data = await contactsService.list();
    res.json({ success: true, data });
  }),

  get: asyncHandler(async (req: Request, res: Response) => {
    const data = await contactsService.get(req.params.id);
    if (!data) return res.status(404).json({ success: false, error: "Not found" });
    res.json({ success: true, data });
  }),

  create: asyncHandler(async (req: Request, res: Response) => {
    const created = await contactsService.create(req.body);
    res.status(201).json({ success: true, data: created });
  }),

  update: asyncHandler(async (req: Request, res: Response) => {
    const updated = await contactsService.update(req.params.id, req.body);
    if (!updated) return res.status(404).json({ success: false, error: "Not found" });
    res.json({ success: true, data: updated });
  }),

  remove: asyncHandler(async (req: Request, res: Response) => {
    const deleted = await contactsService.remove(req.params.id);
    if (!deleted) return res.status(404).json({ success: false, error: "Not found" });
    res.json({ success: true, data: deleted });
  }),
};

export default contactsController;
