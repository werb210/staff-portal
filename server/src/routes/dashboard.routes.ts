import { Router } from "express";
import prisma from "../db/index.js";

const router = Router();

router.get("/", async (_req, res) => {
  try {
    const [applications, tags, ocrItems, users] = await Promise.all([
      prisma.application.count(),
      prisma.tag.count(),
      prisma.ocrResult.count(),
      prisma.user.count(),
    ]);

    res.json({
      ok: true,
      applications,
      tags,
      ocr: ocrItems,
      users,
    });
  } catch (err) {
    console.error("Dashboard error:", err);
    res.status(500).json({ ok: false, error: "Dashboard query failed" });
  }
});

export default router;
