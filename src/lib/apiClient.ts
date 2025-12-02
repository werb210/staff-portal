import axios from "axios";

const baseURL =
  import.meta.env.VITE_STAFF_API_BASE_URL ||
  // fallback during local dev
  "http://localhost:5000";

export const apiClient = axios.create({
  baseURL,
  withCredentials: false,
});

apiClient.interceptors.request.use((config) => {
  try {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers = config.headers ?? {};
      config.headers.Authorization = `Bearer ${token}`;
    }
  } catch (_) {
    // ignore localStorage errors
  }
  return config;
});
