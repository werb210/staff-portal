import { logger } from "@/utils/logger";
export function validateEnv() {
  const required = [import.meta.env.VITE_API_URL ?? import.meta.env.VITE_API_BASE_URL];

  required.forEach((value) => {
    if (!value) {
      logger.error("Missing required environment variable.");
    }
  });
}
