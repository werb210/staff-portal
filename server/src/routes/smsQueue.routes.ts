import { Router } from "express";
import { smsQueueController } from "../controllers/smsQueueController.js";

const router = Router();

router.get("/", smsQueueController.list);
router.get("/:id", smsQueueController.get);
router.post("/", smsQueueController.enqueue);
router.post("/:id/sent", smsQueueController.markSent);
router.post("/:id/failed", smsQueueController.markFailed);

export default router;
