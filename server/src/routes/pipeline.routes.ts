import { Router } from "express";
import prisma from "../db/index.js";

const router = Router();

router.get("/", async (_req, res) => {
  try {
    const applications = await prisma.application.findMany({
      select: {
        id: true,
        businessName: true,
        status: true,
      },
      orderBy: { createdAt: "asc" },
    });

    const stageMap = new Map<string, { id: string; name: string; applications: any[] }>();

    applications.forEach((application) => {
      const stageId = application.status || "Unassigned";

      if (!stageMap.has(stageId)) {
        stageMap.set(stageId, { id: stageId, name: stageId, applications: [] });
      }

      stageMap.get(stageId)?.applications.push({
        id: application.id,
        businessName: application.businessName,
        stageId,
      });
    });

    res.json({ stages: Array.from(stageMap.values()) });
  } catch (err: any) {
    res.status(500).json({
      error: "Failed to fetch pipeline",
      details: err?.message || err,
    });
  }
});

router.post("/move", async (req, res) => {
  const applicationId = String(req.body.applicationId || "");
  const toStageId = String(req.body.toStageId || "");

  if (!applicationId || !toStageId) {
    return res.status(400).json({ error: "applicationId and toStageId are required" });
  }

  try {
    const updated = await prisma.application.update({
      where: { id: applicationId },
      data: { status: toStageId },
    });

    res.json({ ok: true, application: updated });
  } catch (err: any) {
    res.status(500).json({
      error: "Failed to move application",
      details: err?.message || err,
    });
  }
});

export default router;
