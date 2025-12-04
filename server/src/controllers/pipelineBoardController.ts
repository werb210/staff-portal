import { Request, Response } from "express";
import pipelineBoardService from "../services/pipelineBoardService";
import { auditService } from "../services/auditService.js";

const pipelineBoardController = {
  getBoard: async (_req: Request, res: Response) => {
    const data = await pipelineBoardService.getBoard();
    res.json({ success: true, data });
  },

  moveCard: async (req: Request, res: Response) => {
    const { applicationId, fromStage, toStage } = req.body ?? {};

    if (!applicationId || !fromStage || !toStage) {
      return res.status(400).json({
        success: false,
        error: "Missing required fields: applicationId, fromStage, toStage",
      });
    }

    const updated = await pipelineBoardService.moveCard(applicationId, fromStage, toStage);
    await auditService.log(req.user?.id ?? "system", "MOVE", "pipeline_card", String(applicationId), {
      fromStageId: fromStage,
      toStageId: toStage,
    });
    res.json({ success: true, data: updated });
  },
};

export default pipelineBoardController;
