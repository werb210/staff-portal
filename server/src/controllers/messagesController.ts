// server/src/controllers/messagesController.ts
import { Request, Response } from "express";
import { messagesService } from "../services/messagesService.js";

export const messagesController = {
  async send(req: Request, res: Response) {
    const { applicationId, senderId, recipientId, body } = req.body;

    if (!senderId || !body) {
      return res.status(400).json({
        success: false,
        error: "senderId and body are required",
      });
    }

    const msg = await messagesService.send({
      applicationId: applicationId || null,
      senderId,
      recipientId: recipientId || null,
      body,
    });

    return res.status(201).json({ success: true, data: msg });
  },

  async thread(req: Request, res: Response) {
    const { applicationId } = req.params;

    const data = await messagesService.thread(applicationId);
    return res.json({ success: true, data });
  },

  async inbox(req: Request, res: Response) {
    const { userId } = req.params;
    const data = await messagesService.inbox(userId);
    return res.json({ success: true, data });
  },
};
