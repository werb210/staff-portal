import { z } from "zod";

const envSchema = z.object({
  VITE_API_BASE_URL: z.string().url(),
  VITE_JWT_STORAGE_KEY: z.string().min(1),
  NODE_ENV: z.enum(["development", "production", "test"])
});

let parsedEnv: z.infer<typeof envSchema> | null = null;

const parseEnv = () => {
  try {
    parsedEnv = envSchema.parse({
      ...import.meta.env,
      NODE_ENV: import.meta.env.MODE
    });
    return parsedEnv;
  } catch (error) {
    throw new Error(`Missing or invalid required environment variables: ${(error as Error).message}`);
  }
};

export function validateEnv() {
  parseEnv();
}

export const env = new Proxy({} as ImportMetaEnv, {
  get(_target, key) {
    const keyName = String(key);
    if (keyName === "VITE_API_BASE_URL" || keyName === "VITE_JWT_STORAGE_KEY" || keyName === "NODE_ENV") {
      const requiredEnv = parsedEnv ?? parseEnv();
      return requiredEnv[keyName as keyof typeof requiredEnv];
    }

    return import.meta.env[key as keyof ImportMetaEnv];
  }
});
