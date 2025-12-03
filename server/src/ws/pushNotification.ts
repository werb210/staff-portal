import notificationsRepo from "../db/repositories/notifications.repo.js";
import { sendToUser } from "./wsCore.js";

export async function pushNotification(userId: string, title: string, message: string) {
  const record = await notificationsRepo.create({
    userId,
    title,
    body: message,
    type: "system",
  });
  sendToUser(userId, { type: "notification", payload: record });
}
