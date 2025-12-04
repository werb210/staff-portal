import axios from "./axios";

export const ChatAPI = {
  sendMessage(payload: { fromUserId: string; toUserId: string; body: string }) {
    return axios.post("/chat/send", payload).then((r) => r.data.message);
  },

  getThread(userA: string, userB: string) {
    return axios.get(`/chat/thread/${userA}/${userB}`).then((r) => r.data.messages);
  },
};
