import { Router } from "express";
import { smsLogsController } from "../controllers/smsLogsController.js";

const router = Router();

router.get("/", smsLogsController.list);
router.get("/contact/:contactId", smsLogsController.listByContact);
router.get("/:id", smsLogsController.get);
router.post("/", smsLogsController.create);

export default router;
