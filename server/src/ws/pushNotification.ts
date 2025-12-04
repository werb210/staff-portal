import { notificationsService } from "../services/notificationsService.js";
import { sendToUser } from "./wsCore.js";

export async function pushNotification(userId: string, title: string, message: string) {
  const record = await notificationsService.create({
    userId,
    title,
    message,
  });
  sendToUser(userId, { type: "notification", payload: record });
}
