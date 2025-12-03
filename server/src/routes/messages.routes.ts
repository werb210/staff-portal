import { Router } from "express";
import messagesController from "../controllers/messagesController.js";

const router = Router();

router.get("/", messagesController.list);
router.get("/contact/:contactId", messagesController.byContact);
router.get("/company/:companyId", messagesController.byCompany);
router.get("/:id", messagesController.get);

router.post("/", messagesController.create);
router.post("/:id/pin", messagesController.pin);
router.post("/:id/unpin", messagesController.unpin);

export default router;
