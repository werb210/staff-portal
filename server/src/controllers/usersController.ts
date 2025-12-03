import { Request, Response } from "express";
import usersRepo from "../db/repositories/users.repo.js";
import asyncHandler from "../utils/asyncHandler.js";
import bcrypt from "bcryptjs";

export const usersController = {
  list: asyncHandler(async (_req: Request, res: Response) => {
    const data = await usersRepo.findMany();
    res.json({ success: true, data });
  }),

  get: asyncHandler(async (req: Request, res: Response) => {
    const user = await usersRepo.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, error: "User not found" });
    res.json({ success: true, data: user });
  }),

  create: asyncHandler(async (req: Request, res: Response) => {
    const { email, password, role } = req.body;
    const passwordHash = await bcrypt.hash(password, 10);
    const created = await usersRepo.create({ email, passwordHash, role });
    res.status(201).json({ success: true, data: created });
  }),

  update: asyncHandler(async (req: Request, res: Response) => {
    const { email, password, role } = req.body;
    const passwordHash = password ? await bcrypt.hash(password, 10) : undefined;

    const updated = await usersRepo.update(req.params.id, {
      email,
      passwordHash,
      role
    });

    if (!updated) return res.status(404).json({ success: false, error: "User not found" });

    res.json({ success: true, data: updated });
  }),

  remove: asyncHandler(async (req: Request, res: Response) => {
    const deleted = await usersRepo.delete(req.params.id);
    if (!deleted) return res.status(404).json({ success: false, error: "User not found" });
    res.json({ success: true, data: deleted });
  })
};

export default usersController;
