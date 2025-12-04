import { Router } from "express";
import messagesController from "../controllers/messagesController.js";

const router = Router();

router.get("/application/:applicationId", messagesController.listApplication);
router.get("/contact/:contactId", messagesController.listContact);
router.post("/", messagesController.create);

export default router;
