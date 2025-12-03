import { Router } from "express";
import chatController from "../controllers/chatController.js";

const router = Router();

router.post("/conversation", chatController.createConversation);
router.get("/messages/:conversationId", chatController.fetchMessages);
router.post("/messages/:conversationId", chatController.sendMessage);

export default router;
