// server/src/routes/timeline.routes.ts
import { Router } from "express";
import { timelineController } from "../controllers/timelineController.js";

const router = Router();

// List all timeline entries for a given entity
router.get("/:entity/:entityId", timelineController.getForEntity);

// Create a new timeline entry (typically a note)
router.post("/:entity/:entityId", timelineController.addEntry);

export default router;
