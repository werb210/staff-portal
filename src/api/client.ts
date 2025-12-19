import axios from "axios";

export const apiClient = axios.create({
  baseURL: "https://server.boreal.financial",
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

/**
 * Attach Bearer token to EVERY request if present
 */
apiClient.interceptors.request.use((config) => {
  const token =
    localStorage.getItem("access_token") ||
    localStorage.getItem("auth_token") ||
    localStorage.getItem("token");

  if (token) {
    config.headers = config.headers ?? {};
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

export default apiClient;
