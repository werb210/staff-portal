// server/src/controllers/messagesController.ts
import { Request, Response } from "express";
import { messagesService } from "../services/messagesService.js";

export const messagesController = {
  // GET /api/messages/thread/:threadId
  thread: async (req: Request, res: Response) => {
    const { threadId } = req.params;

    const data = await messagesService.thread(threadId);
    return res.json({ success: true, data });
  },

  // POST /api/messages/send
  send: async (req: Request, res: Response) => {
    const { threadId, senderId, receiverId, body } = req.body;

    if (!threadId || !senderId || !body) {
      return res.status(400).json({
        success: false,
        error: "threadId, senderId, and body are required",
      });
    }

    const row = await messagesService.send({
      threadId,
      senderId,
      receiverId: receiverId || null,
      body,
    });

    return res.status(201).json({ success: true, data: row });
  },

  // POST /api/messages/receive
  receive: async (req: Request, res: Response) => {
    const { threadId, senderId, receiverId, body } = req.body;

    if (!threadId || !senderId || !body) {
      return res.status(400).json({
        success: false,
        error: "threadId, senderId, and body are required",
      });
    }

    const row = await messagesService.receive({
      threadId,
      senderId,
      receiverId: receiverId || null,
      body,
    });

    return res.status(201).json({ success: true, data: row });
  },
};
