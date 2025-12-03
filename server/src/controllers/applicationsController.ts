import { Request, Response } from "express";
import applicationsRepo from "../db/repositories/applications.repo.js";

export default {
  list: async (_req: Request, res: Response) => {
    res.json(await applicationsRepo.findAll());
  },

  get: async (req: Request, res: Response) => {
    const id = Number(req.params.id);
    const row = await applicationsRepo.findById(id);
    if (!row) return res.status(404).json({ error: "Not found" });
    res.json(row);
  },

  create: async (req: Request, res: Response) => {
    const created = await applicationsRepo.create(req.body);
    res.status(201).json(created);
  },

  update: async (req: Request, res: Response) => {
    const id = Number(req.params.id);
    const updated = await applicationsRepo.update(id, req.body);
    if (!updated) return res.status(404).json({ error: "Not found" });
    res.json(updated);
  }
};
