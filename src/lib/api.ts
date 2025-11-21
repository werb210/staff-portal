import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: false,
  headers: {
    "Content-Type": "application/json",
  },
});

// OPTIONAL: attach token when auth is implemented
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token") ?? localStorage.getItem("auth_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
export { api };
