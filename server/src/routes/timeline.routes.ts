import { Router } from "express";
import timelineController from "../controllers/timelineController.js";

const router = Router();

router.get("/:contactId", timelineController.getTimeline);
router.post("/:contactId", timelineController.addEvent);

export default router;
