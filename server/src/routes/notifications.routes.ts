import { Router } from "express";
import { notificationsController } from "../controllers/notificationsController.js";

const router = Router();

// GET list for user
router.get("/:userId", notificationsController.list);

// GET unread count
router.get("/:userId/unread-count", notificationsController.unread);

// POST create notification
router.post("/", notificationsController.create);

// POST mark read
router.post("/read/:id", notificationsController.read);

// POST notify all admins
router.post("/notify-admins", notificationsController.notifyAdmins);

export default router;
