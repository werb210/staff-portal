import { useNotificationsStore } from "../../state/notificationsStore";
import { useToastStore } from "../../state/toastStore";

export function handleNotification(msg: any) {
  if (!msg || msg.type !== "notification") return;

  useNotificationsStore.getState().addIncoming(msg.payload);
  useToastStore.getState().push(msg.payload.title, msg.payload.message);
}
