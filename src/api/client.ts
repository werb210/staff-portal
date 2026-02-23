import axios from "axios";
import * as authStorage from "@/lib/authStorage";
import { showApiToast } from "@/state/apiNotifications";

export function getApiBase(silo: string) {
  if (silo === "BI") return "https://api.boreal.financial/bi";
  if (silo === "SLF") return "https://api.boreal.financial/slf";
  return "https://api.boreal.financial/bf";
}

export function createApi(silo: string) {
  return axios.create({
    baseURL: getApiBase(silo)
  });
}

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
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      authStorage.clearAuth();
      window.location.href = "/login";
    } else if (err.response?.status === 403) {
      navigateTo("/unauthorized");
    } else if (!err.response) {
      showApiToast("Network error. Please check your connection and try again.");
    } else if (err.response?.status >= 500) {
      showApiToast("We hit a server issue. Please retry in a moment.");
    }
    return Promise.reject(err);
  }
);

export const clientApi = api;

export const otpStart = (payload: { phone: string }) => api.post("/auth/otp/start", payload);
export const otpVerify = (payload: { phone: string; code: string }) => api.post("/auth/otp/verify", payload);

export default api;
