import axios from "axios";
import { getAccessToken, clearAccessToken } from "../auth/auth.store";

const rawBaseURL = import.meta.env.VITE_API_BASE_URL;

const api = axios.create({
  baseURL: rawBaseURL,
});

export const otp = axios.create({
  baseURL: rawBaseURL,
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
