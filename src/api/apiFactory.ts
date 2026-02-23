import axios from "axios";
import { showToast } from "../utils/toastEvents";

export type ApiSilo = "bf" | "bi" | "slf";

type RetryableRequestConfig = {
  _retry?: boolean;
};

export function createApi(silo: ApiSilo, token: string) {
  const baseMap: Record<ApiSilo, string> = {
    bf: import.meta.env.VITE_API_BF,
    bi: import.meta.env.VITE_API_BI,
    slf: import.meta.env.VITE_API_SLF
  };

  const instance = axios.create({
    baseURL: baseMap[silo]
  });

  instance.interceptors.request.use((config) => {
    config.headers = config.headers ?? {};
    if (token) config.headers.Authorization = `Bearer ${token}`;
    config.headers["x-silo"] = silo;
    return config;
  });

  const logout = () => {
    localStorage.removeItem("portal_token");
    window.location.href = "/login";
  };

  instance.interceptors.response.use(
    (res) => res,
    (err) => {
      const status = err.response?.status;
      const config = (err.config ?? {}) as RetryableRequestConfig;

      if (status === 401 && !config._retry) {
        config._retry = true;
        // future: call /refresh endpoint
        logout();
      }

      if (status === 403) {
        showToast("Access denied", "error");
      }

      if (status === 401) {
        logout();
      }

      return Promise.reject(err);
    }
  );

  return instance;
}
