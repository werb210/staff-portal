// server/src/routes/messages.routes.ts
import { Router } from "express";
import { messagesController } from "../controllers/messagesController.js";

const router = Router();

// Send message
router.post("/", messagesController.send);

// Application thread
router.get("/thread/:applicationId", messagesController.thread);

// User inbox
router.get("/inbox/:userId", messagesController.inbox);

export default router;
