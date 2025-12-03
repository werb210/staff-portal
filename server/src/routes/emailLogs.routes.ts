import { Router } from "express";
import { emailLogsController } from "../controllers/emailLogsController.js";

const router = Router();

router.get("/", emailLogsController.list);
router.get("/contact/:contactId", emailLogsController.byContact);
router.get("/company/:companyId", emailLogsController.byCompany);
router.get("/:id", emailLogsController.get);
router.post("/", emailLogsController.create);

export default router;
