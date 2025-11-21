import { Request, Response } from "express";
import prisma from "../db/index.js";

export async function getFullApplication(req: Request, res: Response) {
  try {
    const id = String(req.params.id);

    const application = await prisma.application.findUnique({
      where: { id },
      include: {
        documents: true,
        ocrFields: true,
        timeline: {
          orderBy: { createdAt: "desc" }
        },
        notes: {
          orderBy: { createdAt: "desc" }
        },
      },
    });

    if (!application) {
      return res.status(404).json({ error: "Application not found" });
    }

    res.json(application);
  } catch (err: any) {
    res.status(500).json({
      error: "Failed to load application",
      details: err.message || err,
    });
  }
}
