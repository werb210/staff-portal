export function validateEnv() {
  const required = [import.meta.env.VITE_API_URL ?? import.meta.env.VITE_API_BASE_URL];

  required.forEach((value) => {
    if (!value) {
      console.error("Missing required environment variable.");
    }
  });
}
