import { Request, Response } from "express";
import chatService from "../services/chatService.js";

const chatController = {
  async createConversation(req: Request, res: Response) {
    try {
      const { clientId, staffUserId } = req.body;
      const convo = await chatService.createConversation(clientId, staffUserId);
      res.json(convo);
    } catch (err: any) {
      res.status(400).json({ ok: false, error: err.message });
    }
  },

  async fetchMessages(req: Request, res: Response) {
    try {
      const { conversationId } = req.params;
      const msgs = await chatService.getMessages(conversationId);
      res.json(msgs);
    } catch (err: any) {
      res.status(400).json({ ok: false, error: err.message });
    }
  },

  async sendMessage(req: Request, res: Response) {
    try {
      const { conversationId } = req.params;
      const { senderRole, text } = req.body;

      const msg = await chatService.addMessage(conversationId, senderRole, text);
      res.json(msg);
    } catch (err: any) {
      res.status(400).json({ ok: false, error: err.message });
    }
  },
};

export default chatController;
