export type RuntimeEnv = {
  API_BASE_URL: string;
};

function readRuntimeEnv(): RuntimeEnv {
  const env = (window as any).__ENV__;
  if (!env || !env.API_BASE_URL) {
    throw new Error("Missing runtime env: API_BASE_URL");
  }
  return {
    API_BASE_URL: env.API_BASE_URL,
  };
}

export const RUNTIME_ENV = readRuntimeEnv();
