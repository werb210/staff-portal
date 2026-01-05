export type RuntimeEnv = {
  API_BASE_URL: string;
};

type RuntimeOverrides = {
  VITE_API_URL?: string;
};

const resolveRuntimeEnv = (): RuntimeEnv => {
  const overrides = (window as Window & { __ENV__?: RuntimeOverrides }).__ENV__;
  const API_BASE_URL = overrides?.VITE_API_URL ?? import.meta.env.VITE_API_URL ?? "";

  return { API_BASE_URL };
};

export const RUNTIME_ENV: RuntimeEnv = resolveRuntimeEnv();
