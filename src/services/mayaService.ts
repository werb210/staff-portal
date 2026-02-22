import api from "@/core/apiClient";

export async function sendMayaMessage(message: string) {
  return api.post("/maya/chat", { message });
}
