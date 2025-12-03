import { Router } from "express";
import { smsController } from "../controllers/smsController.js";

const router = Router();

router.get("/", smsController.list);
router.get("/contact/:contactId", smsController.listByContact);
router.post("/send", smsController.send);
router.get("/:id", smsController.get);

export default router;
