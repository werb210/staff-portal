import { Router } from "express";
import controller from "../controllers/notificationsController.js";
import { requireAuth } from "../middleware/requireAuth.js";

const router = Router();

router.use(requireAuth);

// Fetch
router.get("/", controller.list);
router.get("/unread", controller.unreadForCurrent);
router.get("/user/:userId", controller.listForUser);
router.get("/user/:userId/unread", controller.unread);

// Mark read
router.post("/:id/read", controller.markRead);
router.post("/read-all", controller.markAllReadForCurrent);
router.post("/user/:userId/read-all", controller.markAllRead);

// Create + delete
router.post("/", controller.create);
router.delete("/:id", controller.delete);

export default router;
