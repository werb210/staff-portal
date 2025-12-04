import { Request, Response } from "express";
import { auditLogsRepo } from "../db/repositories/auditLogs.repo.js";

export const auditController = {
  getForEntity: async (req: Request, res: Response) => {
    const { entity, entityId } = req.params;
    const logs = await auditLogsRepo.forEntity(entity, entityId);
    res.json({ success: true, data: logs });
  },

  getForUser: async (req: Request, res: Response) => {
    const { userId } = req.params;
    const logs = await auditLogsRepo.forUser(userId);
    res.json({ success: true, data: logs });
  },
};
