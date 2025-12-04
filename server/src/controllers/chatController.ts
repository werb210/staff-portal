import { Request, Response } from "express";
import asyncHandler from "../utils/asyncHandler.js";
import { chatService } from "../services/chat.service.js";

export const chatController = {
  send: asyncHandler(async (req: Request, res: Response) => {
    const { fromUserId, toUserId, body } = req.body;

    if (!fromUserId || !toUserId || !body) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const msg = await chatService.sendMessage({ fromUserId, toUserId, body });

    res.status(201).json({ success: true, message: msg });
  }),

  thread: asyncHandler(async (req: Request, res: Response) => {
    const { userA, userB } = req.params;

    const messages = await chatService.getConversation(userA, userB);

    res.status(200).json({ success: true, messages });
  }),
};
