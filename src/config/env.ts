import { z } from "zod";

const envSchema = z.object({
  VITE_API_BASE_URL: z.string().trim().min(1, "VITE_API_BASE_URL is required"),
  VITE_APP_ENV: z.string().trim().min(1, "VITE_APP_ENV is required"),
  VITE_JWT_STORAGE_KEY: z.string().trim().min(1, "VITE_JWT_STORAGE_KEY is required"),
  VITE_GA_ID: z.string().trim().min(1).optional(),
  VITE_SENTRY_DSN: z.string().trim().min(1).optional()
});

export type AppEnv = z.infer<typeof envSchema>;

export const validateEnv = (): AppEnv => {
  const parsed = envSchema.safeParse(import.meta.env);

  if (!parsed.success) {
    const message = parsed.error.issues
      .map((issue) => `${issue.path.join(".")}: ${issue.message}`)
      .join("; ");
    throw new Error(`Invalid environment configuration: ${message}`);
  }

  return parsed.data;
};

export const env = validateEnv();
