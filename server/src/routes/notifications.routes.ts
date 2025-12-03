import { Router } from "express";
import controller from "../controllers/notificationsController.js";

const router = Router();

// Fetch
router.get("/user/:userId", controller.list);
router.get("/user/:userId/unread", controller.unread);

// Mark read
router.post("/:id/read", controller.markRead);
router.post("/user/:userId/read-all", controller.markAllRead);

// Create + delete
router.post("/", controller.create);
router.delete("/:id", controller.delete);

export default router;
