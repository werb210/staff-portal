import { Request, Response } from "express";
import contactsRepo from "../db/repositories/contacts.repo.js";
import asyncHandler from "../utils/asyncHandler.js";

export default {
  findMany: asyncHandler(async (_req: Request, res: Response) => {
    const list = await contactsRepo.findMany();
    return res.json(list);
  }),
  findById: asyncHandler(async (req: Request, res: Response) => {
    const record = await contactsRepo.findById(req.params.id);
    return res.json(record || {});
  }),
  create: asyncHandler(async (req: Request, res: Response) => {
    const created = await contactsRepo.create(req.body);
    return res.json(created);
  }),
  update: asyncHandler(async (req: Request, res: Response) => {
    const updated = await contactsRepo.update(req.params.id, req.body);
    return res.json(updated);
  }),
  remove: asyncHandler(async (req: Request, res: Response) => {
    const deleted = await contactsRepo.delete(req.params.id);
    return res.json({ deleted });
  }),
};
