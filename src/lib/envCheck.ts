export function checkEnv() {
  const required = ["VITE_API_BASE_URL"];
  const missing = required.filter((key) => !import.meta.env[key]);

  if (missing.length) {
    console.error("Missing ENV:", missing);
  }
}
