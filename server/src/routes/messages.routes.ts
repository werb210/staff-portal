import { Router } from "express";
import controller from "../controllers/messagesController.js";

const router = Router();

// Fetch
router.get("/user/:userId", controller.listForUser);
router.get("/application/:applicationId", controller.listForApplication);
router.get("/contact/:contactId", controller.listForContact);
router.get("/user/:userId/unread", controller.unread);

// Mark read
router.post("/:id/read", controller.markRead);
router.post("/thread/:userId/:contactId/read", controller.markThreadRead);

// Send message
router.post("/", controller.create);

// Delete
router.delete("/:id", controller.delete);

export default router;
