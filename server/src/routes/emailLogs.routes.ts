import { Router } from "express";
import { emailLogsController } from "../controllers/emailLogsController.js";

const router = Router();

router.get("/", emailLogsController.list);
router.get("/contact/:contactId", emailLogsController.listByContact);
router.get("/:id", emailLogsController.get);
router.post("/", emailLogsController.create);

export default router;
