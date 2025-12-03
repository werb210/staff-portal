import { Router } from "express";
import { messagesController } from "../controllers/messagesController.js";

const router = Router();

router.post("/send", messagesController.send);
router.get("/thread/:id", messagesController.thread);
router.get("/inbox/:userId", messagesController.inbox);

export default router;
