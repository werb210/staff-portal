import { Router } from "express";
import { messagesController } from "../controllers/messagesController.js";

const router = Router();

router.get("/", messagesController.list);
router.get("/contact/:contactId", messagesController.listByContact);
router.get("/:id", messagesController.get);
router.post("/", messagesController.create);
router.delete("/:id", messagesController.remove);

export default router;
