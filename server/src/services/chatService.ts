import chatRepo from "../db/repositories/chat.repo.js";

const chatService = {
  createConversation(clientId: string, staffUserId: string) {
    return chatRepo.createConversation(clientId, staffUserId);
  },

  getMessages(conversationId: string) {
    return chatRepo.getMessages(conversationId);
  },

  addMessage(conversationId: string, senderRole: string, text: string) {
    return chatRepo.addMessage(conversationId, senderRole, text);
  },
};

export default chatService;
