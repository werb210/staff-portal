import { z } from "zod";

const envSchema = z.object({
  VITE_API_BASE_URL: z.string().min(1),
  VITE_JWT_STORAGE_KEY: z.string().min(1)
});

let parsedEnv: z.infer<typeof envSchema> | null = null;

const parseEnv = () => {
  const result = envSchema.safeParse(import.meta.env);
  if (!result.success) {
    const missing = result.error.issues.map((issue) => issue.path.join(".")).join(", ");
    throw new Error(`Missing or invalid required environment variables: ${missing}`);
  }
  parsedEnv = result.data;
  return result.data;
};

export function validateEnv() {
  parseEnv();
}

export const env = new Proxy({} as ImportMetaEnv, {
  get(_target, key) {
    const keyName = String(key);
    if (keyName === "VITE_API_BASE_URL" || keyName === "VITE_JWT_STORAGE_KEY") {
      if (import.meta.env.PROD) {
        const requiredEnv = parsedEnv ?? parseEnv();
        return requiredEnv[keyName as keyof typeof requiredEnv];
      }

      const fallback = keyName === "VITE_JWT_STORAGE_KEY" ? "portal_auth_token" : "";
      return import.meta.env[key as keyof ImportMetaEnv] ?? fallback;
    }

    return import.meta.env[key as keyof ImportMetaEnv];
  }
});
