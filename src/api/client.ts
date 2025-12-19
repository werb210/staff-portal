import axios from "axios";

const api = axios.create({
  baseURL: "https://server.boreal.financial/api",
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

// Attach bearer token to EVERY request
api.interceptors.request.use((config) => {
  const token =
    localStorage.getItem("access_token") ||
    localStorage.getItem("auth_token");

  if (token) {
    config.headers = config.headers ?? {};
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

export default api;
