// server/src/controllers/timelineController.ts
import { Request, Response } from "express";
import { timelineRepo } from "../db/repositories/timeline.repo.js";
import { timelineService } from "../services/timelineService.js";

export const timelineController = {
  // GET /api/timeline/:entity/:entityId
  getForEntity: async (req: Request, res: Response) => {
    const { entity, entityId } = req.params;

    if (!entity || !entityId) {
      return res.status(400).json({
        success: false,
        error: "Missing 'entity' or 'entityId' in route params",
      });
    }

    const logs = await timelineRepo.forEntity(entity, entityId);
    res.json({ success: true, data: logs });
  },

  // POST /api/timeline/:entity/:entityId
  // body: { eventType?: string; message: string }
  addEntry: async (req: Request, res: Response) => {
    const { entity, entityId } = req.params;
    const { eventType, message } = req.body ?? {};

    if (!entity || !entityId) {
      return res.status(400).json({
        success: false,
        error: "Missing 'entity' or 'entityId' in route params",
      });
    }

    if (!message || typeof message !== "string") {
      return res.status(400).json({
        success: false,
        error: "Field 'message' is required",
      });
    }

    const userId =
      // if auth middleware attaches user
      (req as any).user?.id ||
      (req as any).userId ||
      "system";

    const entry = await timelineService.record(
      userId,
      entity,
      entityId,
      eventType || "note",
      message
    );

    res.status(201).json({ success: true, data: entry });
  },
};
