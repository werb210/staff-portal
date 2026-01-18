/*
 * Centralised API base URL configuration.
 */

type ApiEnvironment = "local" | "staging" | "production";

const ENVIRONMENT_KEYS: Record<ApiEnvironment, string> = {
  local: "VITE_API_BASE_URL_LOCAL",
  staging: "VITE_API_BASE_URL_STAGING",
  production: "VITE_API_BASE_URL_PRODUCTION"
};

const SUPPORTED_ENVIRONMENTS = Object.keys(ENVIRONMENT_KEYS) as ApiEnvironment[];

const readEnvValue = (key: string): string | undefined => {
  if (typeof window !== "undefined" && (window as any).__ENV__) {
    const env = (window as any).__ENV__ as Record<string, string | undefined>;
    const value = env[key];
    if (typeof value === "string" && value.trim()) {
      return value.trim();
    }
  }

  if (typeof import.meta !== "undefined" && import.meta.env) {
    const metaEnv = import.meta.env as Record<string, string | undefined>;
    const value = metaEnv[key];
    if (typeof value === "string" && value.trim()) {
      return value.trim();
    }
  }

  return undefined;
};

const normalizeEnvironment = (value: string): ApiEnvironment | null => {
  const normalized = value.trim().toLowerCase();
  if (SUPPORTED_ENVIRONMENTS.includes(normalized as ApiEnvironment)) {
    return normalized as ApiEnvironment;
  }
  return null;
};

export const getApiBaseUrl = (): string => {
  const explicitBaseUrl = readEnvValue("VITE_API_BASE_URL");
  if (explicitBaseUrl) {
    return explicitBaseUrl;
  }

  const envValue =
    readEnvValue("VITE_API_ENV") ??
    readEnvValue("VITE_DEPLOY_ENV") ??
    readEnvValue("VITE_APP_ENV");

  if (envValue) {
    const environment = normalizeEnvironment(envValue);
    if (!environment) {
      throw new Error(
        `Unsupported API environment "${envValue}". Use one of: ${SUPPORTED_ENVIRONMENTS.join(", ")}.`
      );
    }
    const environmentKey = ENVIRONMENT_KEYS[environment];
    const environmentBaseUrl = readEnvValue(environmentKey);
    if (!environmentBaseUrl) {
      throw new Error(
        `Missing ${environmentKey}. Provide an explicit API base URL for the ${environment} environment.`
      );
    }
    return environmentBaseUrl;
  }

  throw new Error(
    "Missing API base URL. Set VITE_API_BASE_URL or set VITE_API_ENV (local/staging/production) with the matching VITE_API_BASE_URL_* variable."
  );
};
