type RuntimeEnv = {
  API_BASE_URL: string;
};

const env = (window as any).__ENV__ as RuntimeEnv | undefined;

if (!env?.API_BASE_URL) {
  throw new Error("API_BASE_URL missing (window.__ENV__)");
}

export const API_BASE_URL = env.API_BASE_URL.replace(/\/+$/, "");

export const getApiBaseUrl = () => API_BASE_URL;
