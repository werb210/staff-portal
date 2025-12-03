import { Router } from "express";
import { notificationsController } from "../controllers/notificationsController.js";

const router = Router();

router.get("/:userId", notificationsController.getForUser);
router.post("/", notificationsController.create);
router.post("/:id/read", notificationsController.markRead);
router.delete("/:id", notificationsController.delete);

export default router;
