// server/src/routes/messages.routes.ts
import { Router } from "express";
import { messagesController } from "../controllers/messagesController.js";

const router = Router();

// Fetch entire thread
router.get("/thread/:threadId", messagesController.thread);

// Send outbound message
router.post("/send", messagesController.send);

// Receive inbound message (webhook or internal)
router.post("/receive", messagesController.receive);

export default router;
