import { Request, Response } from "express";
import messagesService from "../services/messagesService.js";

export async function getMessages(req: Request, res: Response) {
  try {
    const { contactId } = req.params;
    if (!contactId) return res.status(400).json({ error: "contactId required" });

    const messages = await messagesService.getMessagesForContact(contactId);
    res.json(messages);
  } catch (err: any) {
    console.error("getMessages error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
}

export async function postMessage(req: Request, res: Response) {
  try {
    const { contactId } = req.params;
    const { sender, body } = req.body;

    if (!contactId) return res.status(400).json({ error: "contactId required" });
    if (!sender || !body) return res.status(400).json({ error: "sender and body required" });

    const message = await messagesService.createMessage(contactId, sender, body);
    res.status(201).json(message);
  } catch (err: any) {
    console.error("postMessage error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
}

export async function deleteMessage(req: Request, res: Response) {
  try {
    const { id } = req.params;
    if (!id) return res.status(400).json({ error: "id required" });

    await messagesService.deleteMessage(id);
    res.json({ success: true });
  } catch (err: any) {
    console.error("deleteMessage error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
}

export default {
  getMessages,
  postMessage,
  deleteMessage,
};
