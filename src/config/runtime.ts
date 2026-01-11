import { API_BASE_URL } from "@/config/api";

export type RuntimeEnv = {
  apiBaseUrl: string;
};

let cachedRuntimeEnv: RuntimeEnv | null = null;

export const getApiBaseUrlOptional = () => API_BASE_URL;

const resolveRuntimeEnv = (): RuntimeEnv => ({ apiBaseUrl: API_BASE_URL });

export const getRuntimeEnv = (): RuntimeEnv => {
  if (!cachedRuntimeEnv) {
    cachedRuntimeEnv = resolveRuntimeEnv();
  }

  return cachedRuntimeEnv;
};

export const getApiBaseUrl = () => getRuntimeEnv().apiBaseUrl;
