export type RuntimeEnv = {
  API_BASE_URL: string;
};

const API_BASE_URL = "https://server.boreal.financial";

export const RUNTIME_ENV: RuntimeEnv = {
  API_BASE_URL,
};
