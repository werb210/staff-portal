import axios from "axios";

const API_BASE = import.meta.env.VITE_API_URL;

export const api = axios.create({
  baseURL: API_BASE,
  withCredentials: false,
});

// Attach token automatically
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("bf_staff_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle expired tokens
api.interceptors.response.use(
  (res) => res,
  async (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem("bf_staff_token");
      window.location.href = "/login";
    }
    throw err;
  }
);
