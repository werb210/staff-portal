import { Request, Response } from "express";
import asyncHandler from "../utils/asyncHandler.js";
import { messagesRepo } from "../db/repositories/messages.repo.js";
import { pushNotification } from "../realtime/socketServer.js";

export const messagesController = {
  send: asyncHandler(async (req: Request, res: Response) => {
    const { threadId, senderId, recipientId, body } = req.body;

    if (!threadId || !senderId || !recipientId || !body) {
      return res.status(400).json({ error: "Missing fields" });
    }

    const msg = await messagesRepo.send({ threadId, senderId, recipientId, body });

    pushNotification(recipientId, {
      event: "message",
      data: msg,
    });

    return res.status(201).json({ success: true, data: msg });
  }),

  thread: asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const msgs = await messagesRepo.threadMessages(id);
    res.json({ success: true, data: msgs });
  }),

  inbox: asyncHandler(async (req: Request, res: Response) => {
    const userId = req.params.userId;
    const msgs = await messagesRepo.inboxFor(userId);
    res.json({ success: true, data: msgs });
  }),
};
