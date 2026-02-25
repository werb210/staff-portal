const required = [
  "VITE_API_BASE_URL",
  "VITE_JWT_STORAGE_KEY"
] as const;

type RequiredEnv = (typeof required)[number];

function getEnv(key: RequiredEnv): string {
  const value = import.meta.env[key];

  if (!value) {
    console.warn(`[ENV WARNING] Missing ${key}. Using safe fallback.`);
  }

  return value || "";
}

export const ENV = {
  API_BASE_URL:
    getEnv("VITE_API_BASE_URL") ||
    (window.location.hostname.includes("boreal.financial")
      ? "https://api.staff.boreal.financial"
      : "http://localhost:3000"),

  JWT_STORAGE_KEY:
    getEnv("VITE_JWT_STORAGE_KEY") || "boreal_staff_token"
};
