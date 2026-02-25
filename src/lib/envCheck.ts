export function validateEnv() {
  if (import.meta.env.MODE !== "production") return;

  if (!import.meta.env.VITE_API_BASE_URL) {
    throw new Error("Missing VITE_API_BASE_URL");
  }
}
