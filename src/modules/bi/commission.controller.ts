import type { Request, Response } from "express";
import { siloQuery } from "../../../db/siloQuery";
import { logBIAudit } from "../../../utils/biAuditLogger";

export async function getBICommissionById(_db: unknown, req: Request, res: Response) {
  if (!req.user) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  if (req.user.role !== "Admin" && req.user.role !== "BI_Manager") {
    return res.status(403).json({ error: "Commission access restricted" });
  }

  if (!req.silo) {
    return res.status(403).json({ error: "Missing silo context" });
  }

  const commissionId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;

  const result = await siloQuery(
    req.silo,
    `
    SELECT *
    FROM commissions
    WHERE id = $1
    `,
    [commissionId]
  );

  if (req.user.id) {
    await logBIAudit(req.user.id, req.silo, "commission.view", commissionId, {
      source: "bi_commission_controller"
    });
  }

  return res.status(200).json(result.rows[0] ?? null);
}
