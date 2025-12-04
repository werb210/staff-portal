import { Request, Response, Router } from "express";
import pipelineRepo from "../db/repositories/pipeline.repo.js";
import pipelineEventsRepo from "../db/repositories/pipelineEvents.repo.js";

const router = Router();

// GET /api/pipeline/stages
router.get("/stages", async (_req: Request, res: Response) => {
  try {
    const result = await pipelineRepo.findStages();
    res.json({ success: true, data: result.rows ?? result });
  } catch (err: any) {
    console.error("pipelineController.stages error:", err);
    res.status(500).json({ success: false, error: "Failed to load stages" });
  }
});

// GET /api/pipeline/stages/:id/deals
router.get("/stages/:id/deals", async (req: Request, res: Response) => {
  try {
    const result = await pipelineRepo.findDealsByStage(req.params.id);
    res.json({ success: true, data: result.rows ?? result });
  } catch (err: any) {
    console.error("pipelineController.deals error:", err);
    res.status(500).json({ success: false, error: "Failed to load deals for stage" });
  }
});

// POST /api/pipeline/move
router.post("/move", async (req: Request, res: Response) => {
  try {
    const { dealId, fromStage, toStage } = req.body ?? {};
    if (!dealId || !toStage) {
      return res.status(400).json({ success: false, error: "Missing dealId or toStage" });
    }
    const result = await pipelineEventsRepo.logMove(dealId, fromStage ?? null, toStage);
    const record = (result.rows ?? result)[0];
    res.status(201).json({ success: true, data: record });
  } catch (err: any) {
    console.error("pipelineController.move error:", err);
    res.status(500).json({ success: false, error: "Failed to move deal" });
  }
});

export default router;
