import { Router } from "express";
import messagesController from "../controllers/messagesController.js";

const router = Router();

// GET all messages for a contact
router.get("/:contactId", messagesController.getMessages);

// POST new message for a contact
router.post("/:contactId", messagesController.postMessage);

// DELETE a message
router.delete("/:id", messagesController.deleteMessage);

export default router;
