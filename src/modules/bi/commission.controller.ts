import type { Request, Response } from "express";
import type { QueryableDb } from "../../../db";
import { logBIAudit } from "../../../utils/biAuditLogger";

type CommissionAuthRequest = Request & {
  user?: {
    id?: string;
    role?: string;
    silo?: string;
  };
};

export async function getBICommissionById(db: QueryableDb, req: Request, res: Response) {
  const authReq = req as CommissionAuthRequest;

  if (!authReq.user) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  if (
    authReq.user.silo !== "BI" ||
    (authReq.user.role !== "Admin" && authReq.user.role !== "BI_Manager")
  ) {
    return res.status(403).json({ error: "Commission access restricted" });
  }

  const commissionId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;

  const result = await db.query(
    `
    SELECT *
    FROM commissions
    WHERE silo = 'BI'
    AND id = $1
    `,
    [commissionId]
  );

  if (authReq.user.id) {
    await logBIAudit(authReq.user.id, "commission.view", commissionId, {
      source: "bi_commission_controller"
    });
  }

  return res.status(200).json(result.rows[0] ?? null);
}
