import axios from "axios";
import { getAuthToken } from "../utils/authToken";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
});

api.interceptors.request.use((c) => {
  const t = getAuthToken();
  if (t) c.headers.Authorization = `Bearer ${t}`;
  return c;
});

export const fetchNotifications = (userId: string) =>
  api.get(`/api/notifications/user/${userId}`).then((r) => r.data.data);

export const markNotificationRead = (id: string) => api.post(`/api/notifications/${id}/read`);
