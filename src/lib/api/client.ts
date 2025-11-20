import axios from "axios";

const API_BASE = import.meta.env.VITE_API_URL ?? "http://localhost:5000";

export const api = axios.create({
  baseURL: API_BASE,
  withCredentials: false,
  timeout: 20000,
});

// Attach JWT token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("bf_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Handle 401
api.interceptors.response.use(
  (res) => res,
  async (err) => {
    if (err?.response?.status === 401) {
      localStorage.removeItem("bf_token");
      window.location.href = "/login";
    }
    throw err;
  }
);

export default api;
