import messagesRepo from "../db/repositories/messages.repo.js";

export async function getMessagesForContact(contactId: string) {
  return messagesRepo.findByContact(contactId);
}

export async function createMessage(contactId: string, sender: string, body: string) {
  return messagesRepo.create({
    contactId,
    sender,
    body,
    createdAt: new Date(),
  });
}

export async function deleteMessage(id: string) {
  return messagesRepo.delete(id);
}

export default {
  getMessagesForContact,
  createMessage,
  deleteMessage,
};
