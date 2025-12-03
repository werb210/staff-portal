import { Request, Response } from "express";
import tagsRepo from "../db/repositories/tags.repo.js";

export default {
  list: async (_req: Request, res: Response) => {
    res.json(await tagsRepo.findAll());
  },

  create: async (req: Request, res: Response) => {
    const created = await tagsRepo.create(req.body);
    res.status(201).json(created);
  },

  delete: async (req: Request, res: Response) => {
    const id = Number(req.params.id);
    await tagsRepo.delete(id);
    res.json({ success: true });
  }
};
