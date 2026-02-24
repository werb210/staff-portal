import { Router } from "express";
import { db } from "../db";

const router = Router();

router.get("/api/bi/dashboard", async (req, res) => {
  try {
    if (req.user?.silo !== "BI") {
      return res.status(403).json({ error: "Forbidden" });
    }

    const silo = "BI";

    const [totalApps, pendingDocs, approved, rejected, highRisk, totalReferrers, totalLenders] = await Promise.all([
      db.query("SELECT COUNT(*) FROM applications WHERE silo = $1", [silo]),
      db.query("SELECT COUNT(*) FROM applications WHERE silo = $1 AND status = 'Documents Pending'", [silo]),
      db.query("SELECT COUNT(*) FROM applications WHERE silo = $1 AND status = 'Approved by Purbeck'", [silo]),
      db.query("SELECT COUNT(*) FROM applications WHERE silo = $1 AND status = 'Rejected'", [silo]),
      db.query("SELECT COUNT(*) FROM applications WHERE silo = $1 AND underwriting_risk_level = 'High'", [silo]),
      db.query("SELECT COUNT(*) FROM referrers WHERE silo = $1", [silo]),
      db.query("SELECT COUNT(*) FROM lenders WHERE silo = $1", [silo])
    ]);

    return res.json({
      totalApplications: Number((totalApps.rows[0] as { count?: string }).count ?? 0),
      documentsPending: Number((pendingDocs.rows[0] as { count?: string }).count ?? 0),
      approved: Number((approved.rows[0] as { count?: string }).count ?? 0),
      rejected: Number((rejected.rows[0] as { count?: string }).count ?? 0),
      highRiskCount: Number((highRisk.rows[0] as { count?: string }).count ?? 0),
      referrers: Number((totalReferrers.rows[0] as { count?: string }).count ?? 0),
      lenders: Number((totalLenders.rows[0] as { count?: string }).count ?? 0)
    });
  } catch (err) {
    console.error("BI dashboard error:", err);
    return res.status(500).json({ error: "Internal error" });
  }
});

export default router;
