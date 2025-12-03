import { Router } from "express";
import controller from "../controllers/smsLogsController.js";

const router = Router();

// GET /api/sms-logs
router.get("/", controller.list);

// GET /api/sms-logs/contact/:contactId
router.get("/contact/:contactId", controller.byContact);

// GET /api/sms-logs/company/:companyId
router.get("/company/:companyId", controller.byCompany);

// GET /api/sms-logs/phone/:phone
router.get("/phone/:phone", controller.byPhone);

// GET /api/sms-logs/:id
router.get("/:id", controller.get);

// POST /api/sms-logs
router.post("/", controller.create);

export default router;
