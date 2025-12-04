import { Router } from "express";
import notificationsController from "../controllers/notificationsController.js";

const router = Router();

router.get("/user/:userId", notificationsController.listForUser);
router.get("/user/:userId/unread", notificationsController.listUnread);
router.post("/", notificationsController.create);
router.post("/:id/read", notificationsController.markRead);

export default router;
