import axios from "axios";
import { getToken } from "./auth";

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "https://boreal-staff-server.azurewebsites.net",
  withCredentials: false
});

api.interceptors.request.use((config) => {
  const token = getToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default api;
