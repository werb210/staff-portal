import { Router } from "express";
import { db } from "../db";
import { enforceBISilo } from "../middleware/enforceBISilo";

const router = Router();

/**
 * BI Revenue Dashboard
 * STRICT SILO ENFORCEMENT
 */
router.get("/api/bi/revenue", enforceBISilo, async (req, res) => {
  try {
    // Double safety: explicit silo guard
    if (req.user?.silo !== "BI") {
      return res.status(403).json({ error: "Forbidden" });
    }

    const silo = "BI";

    const totalPremium = await db.query(
      `
        SELECT COALESCE(SUM(premium_amount), 0) AS total
        FROM applications
        WHERE silo = $1
        AND status = 'Approved by Purbeck'
        `,
      [silo]
    );

    const totalCommission = await db.query(
      `
        SELECT COALESCE(SUM(commission_amount), 0) AS total
        FROM commissions
        WHERE silo = $1
        `,
      [silo]
    );

    const commissionPaid = await db.query(
      `
        SELECT COALESCE(SUM(commission_amount), 0) AS total
        FROM commissions
        WHERE silo = $1
        AND status = 'Paid'
        `,
      [silo]
    );

    const commissionOutstanding = await db.query(
      `
        SELECT COALESCE(SUM(commission_amount), 0) AS total
        FROM commissions
        WHERE silo = $1
        AND status = 'Pending'
        `,
      [silo]
    );

    const approvedApps = await db.query(
      `
        SELECT COUNT(*) AS count
        FROM applications
        WHERE silo = $1
        AND status = 'Approved by Purbeck'
        `,
      [silo]
    );

    return res.json({
      totalPremium: (totalPremium.rows[0] as { total?: string | number }).total ?? 0,
      totalCommission: (totalCommission.rows[0] as { total?: string | number }).total ?? 0,
      commissionPaid: (commissionPaid.rows[0] as { total?: string | number }).total ?? 0,
      commissionOutstanding: (commissionOutstanding.rows[0] as { total?: string | number }).total ?? 0,
      approvedApplications: (approvedApps.rows[0] as { count?: string | number }).count ?? 0
    });
  } catch (err) {
    console.error("BI revenue error:", err);
    return res.status(500).json({ error: "Internal error" });
  }
});

export default router;
