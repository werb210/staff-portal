export type RuntimeEnv = {
  apiBaseUrl: string;
};

let cachedRuntimeEnv: RuntimeEnv | null = null;

const readApiBaseUrl = () => import.meta.env.VITE_API_BASE_URL;

export const getApiBaseUrlOptional = () => readApiBaseUrl();

const resolveRuntimeEnv = (): RuntimeEnv => {
  const apiBaseUrl = readApiBaseUrl();

  if (!apiBaseUrl) {
    throw new Error(
      "Missing VITE_API_BASE_URL. Set VITE_API_BASE_URL to the staff portal API base URL before using the app."
    );
  }

  return { apiBaseUrl };
};

export const getRuntimeEnv = (): RuntimeEnv => {
  if (!cachedRuntimeEnv) {
    cachedRuntimeEnv = resolveRuntimeEnv();
  }

  return cachedRuntimeEnv;
};

export const getApiBaseUrl = () => getRuntimeEnv().apiBaseUrl;
