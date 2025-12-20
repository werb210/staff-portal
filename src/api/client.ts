import axios, { type AxiosRequestConfig } from "axios";

type AuthenticatedRequestConfig = AxiosRequestConfig & {
  skipAuth?: boolean;
};

const API_BASE =
  import.meta.env.VITE_API_BASE_URL || "https://server.boreal.financial";

const apiClient = axios.create({
  baseURL: API_BASE,
  headers: {
    "Content-Type": "application/json",
  },
});

apiClient.interceptors.request.use((config: AuthenticatedRequestConfig) => {
  if (config.skipAuth) return config;

  const token = localStorage.getItem("accessToken");
  if (!token) {
    throw new Error("Missing access token");
  }

  const headers = config.headers ?? {};
  return {
    ...config,
    headers: {
      ...headers,
      Authorization: `Bearer ${token}`,
    },
  } as AuthenticatedRequestConfig;
});

export default apiClient;
export { apiClient };
