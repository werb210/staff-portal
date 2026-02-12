const REQUIRED = ["VITE_API_BASE_URL"] as const;

export function validateEnv() {
  const missing = REQUIRED.filter((key) => !import.meta.env[key]);
  if (missing.length) {
    throw new Error(`Missing required environment variables: ${missing.join(", ")}`);
  }
}

export const env = new Proxy({} as ImportMetaEnv, {
  get(_target, key) {
    return import.meta.env[key as keyof ImportMetaEnv];
  }
});
