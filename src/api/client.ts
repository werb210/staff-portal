import axios from "axios";
import { showApiToast } from "@/state/apiNotifications";

const baseURL = import.meta.env.VITE_API_BASE_URL;

const navigateTo = (path: string) => {
  if (typeof window === "undefined") return;
  if (window.location.pathname === path) return;
  const isTestEnv = typeof process !== "undefined" && process.env?.NODE_ENV === "test";
  if (isTestEnv) {
    window.history.pushState({}, "", path);
    window.dispatchEvent(new PopStateEvent("popstate"));
    return;
  }
  window.location.assign(path);
};

const api = axios.create({
  baseURL
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      navigateTo("/login");
    } else if (error.response?.status === 403) {
      navigateTo("/unauthorized");
    } else if (!error.response) {
      showApiToast("Network error. Please check your connection and try again.");
    } else if (error.response?.status >= 500) {
      showApiToast("We hit a server issue. Please retry in a moment.");
    }
    return Promise.reject(error);
  }
);

export const clientApi = api;

export const otpStart = (payload: { phone: string }) => api.post("/auth/otp/start", payload);
export const otpVerify = (payload: { phone: string; code: string }) => api.post("/auth/otp/verify", payload);

export default api;
