import { Request, Response } from "express";
import pipelineStageService from "../services/pipelineStageService";

const pipelineStageController = {
  list: async (_req: Request, res: Response) => {
    const data = await pipelineStageService.list();
    res.json({ success: true, data });
  },

  get: async (req: Request, res: Response) => {
    const rec = await pipelineStageService.get(req.params.id);
    if (!rec) return res.status(404).json({ success: false, error: "Not found" });
    res.json({ success: true, data: rec });
  },

  create: async (req: Request, res: Response) => {
    const created = await pipelineStageService.create(req.body ?? {});
    res.status(201).json({ success: true, data: created });
  },

  update: async (req: Request, res: Response) => {
    const updated = await pipelineStageService.update(req.params.id, req.body ?? {});
    if (!updated) return res.status(404).json({ success: false, error: "Not found" });
    res.json({ success: true, data: updated });
  },

  remove: async (req: Request, res: Response) => {
    const out = await pipelineStageService.remove(req.params.id);
    if (!out) return res.status(404).json({ success: false, error: "Not found" });
    res.json({ success: true, data: out });
  },
};

export default pipelineStageController;
