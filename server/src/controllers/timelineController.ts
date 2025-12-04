import { Request, Response, Router } from "express";
import timelineRepo from "../db/repositories/timeline.repo.js";

const router = Router();

// GET /api/timeline/contact/:contactId
router.get("/contact/:contactId", async (req: Request, res: Response) => {
  try {
    const result = await timelineRepo.findByContact(req.params.contactId);
    res.json({ success: true, data: result.rows ?? result });
  } catch (err: any) {
    console.error("timelineController.list error:", err);
    res.status(500).json({ success: false, error: "Failed to fetch timeline" });
  }
});

// POST /api/timeline
router.post("/", async (req: Request, res: Response) => {
  try {
    const result = await timelineRepo.addEntry(req.body ?? {});
    const record = (result.rows ?? result)[0];
    res.status(201).json({ success: true, data: record });
  } catch (err: any) {
    console.error("timelineController.create error:", err);
    res.status(500).json({ success: false, error: "Failed to create timeline entry" });
  }
});

export default router;
