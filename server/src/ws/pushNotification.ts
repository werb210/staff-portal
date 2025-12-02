import { sendToUser } from "./wsCore.js";
import { notificationsRepo } from "../db/repositories/notifications.repo.js";

export async function pushNotification(userId: string, title: string, message: string) {
  const record = await notificationsRepo.create({ userId, title, message });
  sendToUser(userId, { type: "notification", payload: record });
}
