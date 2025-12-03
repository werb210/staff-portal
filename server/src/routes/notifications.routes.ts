import { Router } from "express";
import { notificationsController } from "../controllers/notificationsController.js";

const router = Router();

router.get("/", notificationsController.list);
router.get("/:id", notificationsController.get);
router.get("/contact/:contactId", notificationsController.listByContact);
router.post("/", notificationsController.create);
router.post("/:id/read", notificationsController.markRead);
router.delete("/:id", notificationsController.remove);

export default router;
