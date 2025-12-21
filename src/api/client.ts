import axios, { AxiosError, type AxiosRequestConfig } from "axios";
import {
  API_BASE,
  buildApiUrl,
  getStoredAccessToken,
  handleUnauthorized
} from "@/services/api";

type AuthenticatedRequestConfig = AxiosRequestConfig & {
  skipAuth?: boolean;
};

const apiClient = axios.create({
  baseURL: API_BASE,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: false,
});

const persistedToken = getStoredAccessToken();
if (persistedToken) {
  apiClient.defaults.headers.common.Authorization = `Bearer ${persistedToken}`;
}

apiClient.interceptors.request.use((config: AuthenticatedRequestConfig) => {
  const url = config.url?.startsWith("http")
    ? config.url
    : buildApiUrl(config.url ?? "");

  if (config.skipAuth) {
    return { ...config, url } as AuthenticatedRequestConfig;
  }

  const token = getStoredAccessToken();
  if (!token) {
    handleUnauthorized();
    throw new Error("Missing access token");
  }

  const headers = config.headers ?? {};

  return {
    ...config,
    url,
    withCredentials: false,
    headers: {
      ...headers,
      Authorization: `Bearer ${token}`,
    },
  } as AuthenticatedRequestConfig;
});

apiClient.interceptors.response.use(
  (response) => {
    const requestConfig = response.config as AuthenticatedRequestConfig | undefined;
    if (response.status === 401 && !requestConfig?.skipAuth) {
      delete apiClient.defaults.headers.common.Authorization;
      handleUnauthorized();
      return Promise.reject(
        new AxiosError("Unauthorized", undefined, response.config, response.request, response)
      );
    }

    return response;
  },
  (error: AxiosError) => {
    const responseStatus = error.response?.status;
    const requestConfig = error.config as AuthenticatedRequestConfig | undefined;

    if (responseStatus === 401 && !requestConfig?.skipAuth) {
      delete apiClient.defaults.headers.common.Authorization;
      handleUnauthorized();
    }

    return Promise.reject(error);
  }
);

export default apiClient;
export { apiClient };
