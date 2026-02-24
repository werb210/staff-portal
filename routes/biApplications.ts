import { Router } from "express";
import { db } from "../db";
import { enforceBISilo } from "../middleware/enforceBISilo";
import { calculateBIUnderwritingScore } from "../server/services/biUnderwritingScore";

const router = Router();

router.patch("/api/bi/applications/:applicationId", enforceBISilo, async (req, res) => {
  try {
    const { applicationId } = req.params;
    const silo = "BI";

    const appResult = await db.query(
      `
      SELECT *
      FROM applications
      WHERE id = $1
      AND silo = $2
      `,
      [applicationId, silo]
    );

    if (!appResult.rows.length) {
      return res.status(404).json({ error: "Not found" });
    }

    const application = appResult.rows[0] as {
      coverage_type?: string | null;
      loan_amount?: number | string | null;
      status?: string | null;
      referrer_id?: string | number | null;
    };

    const { score, risk } = calculateBIUnderwritingScore(application);

    await db.query(
      `
      UPDATE applications
      SET underwriting_score = $1,
          underwriting_risk_level = $2
      WHERE id = $3
      AND silo = $4
      `,
      [score, risk, applicationId, silo]
    );

    return res.json({ applicationId, underwritingScore: score, underwritingRiskLevel: risk });
  } catch (err) {
    console.error("BI application update error:", err);
    return res.status(500).json({ error: "Internal error" });
  }
});

export default router;
