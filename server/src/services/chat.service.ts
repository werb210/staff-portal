import chatRepo from "../db/repositories/chat.repo.js";
import { broadcastToUser } from "../realtime/wsServer.js";

export const chatService = {
  async sendMessage({ fromUserId, toUserId, body }) {
    const msg = await chatRepo.create({
      threadType: "direct",
      userA: fromUserId,
      userB: toUserId,
      fromUserId,
      toUserId,
      body,
    });

    broadcastToUser(toUserId, "chat_message", msg);
    broadcastToUser(fromUserId, "chat_message", msg);

    return msg;
  },

  async getConversation(userA: string, userB: string) {
    return chatRepo.getConversation(userA, userB);
  },
};
