import { Request, Response } from "express";
import lendersRepo from "../db/repositories/lenders.repo.js";

export default {
  list: async (_req: Request, res: Response) => {
    const rows = await lendersRepo.findAll();
    res.json(rows);
  },

  get: async (req: Request, res: Response) => {
    const id = Number(req.params.id);
    const row = await lendersRepo.findById(id);
    if (!row) return res.status(404).json({ error: "Not found" });
    res.json(row);
  },

  create: async (req: Request, res: Response) => {
    const created = await lendersRepo.create(req.body);
    res.status(201).json(created);
  },

  update: async (req: Request, res: Response) => {
    const id = Number(req.params.id);
    const updated = await lendersRepo.update(id, req.body);
    if (!updated) return res.status(404).json({ error: "Not found" });
    res.json(updated);
  }
};
