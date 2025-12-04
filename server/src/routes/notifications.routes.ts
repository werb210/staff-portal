import { Router } from "express";
import { notificationsController } from "../controllers/notificationsController.js";

const router = Router();

router.get("/:userId", notificationsController.list);
router.get("/:userId/unread", notificationsController.unread);

router.post("/read/:id", notificationsController.markRead);
router.post("/read-all/:userId", notificationsController.markAll);

export default router;
