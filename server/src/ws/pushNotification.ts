import notificationsService from "../services/notifications.service.js";
import { sendToUser } from "./wsCore.js";

export async function pushNotification(userId: string, title: string, message: string) {
  const record = await notificationsService.create({
    userId,
    type: "general",
    message: `${title}: ${message}`,
  });
  sendToUser(userId, { type: "notification", payload: record });
}
