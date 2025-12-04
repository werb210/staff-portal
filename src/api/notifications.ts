import api from "./client";

export const notificationsApi = {
  list(userId: string) {
    return api.get(`/notifications/user/${userId}`);
  },
  unread(userId: string) {
    return api.get(`/notifications/user/${userId}/unread`);
  },
  create(payload: any) {
    return api.post(`/notifications`, payload);
  },
  markRead(id: string) {
    return api.post(`/notifications/${id}/read`);
  },
};
