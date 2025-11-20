import axios from "axios";
import { getToken, logout } from "./storage";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ||
    "https://boreal-staff-server.azurewebsites.net",
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 20000,
});

api.interceptors.request.use((config) => {
  const token = getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      logout();
      window.location.href = "/login";
    }

    console.error("API error:", err?.response?.data || err.message);
    return Promise.reject(err);
  }
);

export default api;
export { api };
