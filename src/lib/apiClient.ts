import axios from "axios";
import { pushToast } from "@/components/ui/toast";
import { useAuthStore } from "@/store/authStore";

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
});

apiClient.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;
  if (token) {
    config.headers = config.headers ?? {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error?.response?.status === 401) {
      pushToast({
        title: "Session expired",
        description: "Please sign in again to continue.",
        variant: "destructive",
      });
      useAuthStore.getState().logout();
    }
    return Promise.reject(error);
  }
);

export default apiClient;
