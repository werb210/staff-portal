import { Router } from "express";
import { chatController } from "../controllers/chatController.js";

const router = Router();

router.post("/send", chatController.send);
router.get("/thread/:userA/:userB", chatController.thread);

export default router;
