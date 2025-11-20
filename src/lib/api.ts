import axios from "axios";

// -----------------------------------------------------------------------------
// Base URL (local dev OR Azure hosted build)
// -----------------------------------------------------------------------------
const API_BASE =
  import.meta.env.VITE_API_URL ||
  (window.location.hostname === "localhost"
    ? "http://localhost:5000"
    : "https://boreal-staff-server.azurewebsites.net");

// -----------------------------------------------------------------------------
// Axios Instance
// -----------------------------------------------------------------------------
const api = axios.create({
  baseURL: API_BASE,
  withCredentials: false,
  timeout: 20000,
});

// -----------------------------------------------------------------------------
// Request Interceptor — attach JWT from localStorage
// -----------------------------------------------------------------------------
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("auth_token");
    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// -----------------------------------------------------------------------------
// Response Interceptor — handle 401 / token refresh placeholder
// -----------------------------------------------------------------------------
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const status = error?.response?.status;

    if (status === 401) {
      // Optional: token refresh logic can be wired here later
      localStorage.removeItem("auth_token");
      window.location.href = "/login";
    }

    return Promise.reject(error);
  }
);

// -----------------------------------------------------------------------------
// Typed helper methods
// -----------------------------------------------------------------------------
export const get = (url: string, config?: any) => api.get(url, config);
export const post = (url: string, data?: any, config?: any) =>
  api.post(url, data, config);
export const put = (url: string, data?: any, config?: any) =>
  api.put(url, data, config);
export const del = (url: string, config?: any) => api.delete(url, config);

export default api;
