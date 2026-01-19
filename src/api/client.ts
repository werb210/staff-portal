import axios from "axios";
import { getAccessToken, clearAccessToken } from "../auth/auth.store";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
});

api.interceptors.request.use((config) => {
  const token = getAccessToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    const status = err.response?.status;
    if (status === 401 || status === 403) {
      clearAccessToken();
      window.location.href = "/login";
    }
    return Promise.reject(err);
  }
);

export default api;
