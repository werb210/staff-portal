import { auditLogsRepo } from "../db/repositories/auditLogs.repo.js";

export const auditService = {
  async log(userId: string, action: string, entity: string, entityId: string, details?: any) {
    await auditLogsRepo.create({
      userId,
      action,
      entity,
      entityId,
      details: details ? JSON.stringify(details) : null,
    });
  },
};
