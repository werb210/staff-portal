import { Request, Response } from "express";
import { smsQueueService } from "../services/smsQueueService.js";

export const smsQueueController = {
  async list(_req: Request, res: Response) {
    const items = await smsQueueService.list();
    res.json(items);
  },

  async get(req: Request, res: Response) {
    const { id } = req.params;
    const item = await smsQueueService.get(id);
    if (!item) return res.status(404).json({ error: "Not found" });
    res.json(item);
  },

  async enqueue(req: Request, res: Response) {
    const created = await smsQueueService.enqueue(req.body);
    res.status(201).json(created);
  },

  async markSent(req: Request, res: Response) {
    const { id } = req.params;
    const updated = await smsQueueService.markSent(id);
    if (!updated) return res.status(404).json({ error: "Not found" });
    res.json(updated);
  },

  async markFailed(req: Request, res: Response) {
    const { id } = req.params;
    const updated = await smsQueueService.markFailed(id);
    if (!updated) return res.status(404).json({ error: "Not found" });
    res.json(updated);
  },
};
