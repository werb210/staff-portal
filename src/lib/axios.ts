import axios from "axios";
import { API_URL } from "./env";
import { getToken } from "./auth";

export const api = axios.create({
  baseURL: API_URL,
  timeout: 20000
});

api.interceptors.request.use((config) => {
  const token = getToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default api;
