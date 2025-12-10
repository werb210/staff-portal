export const API_BASE_URL = import.meta.env.VITE_API_URL as string;
export const ENV = import.meta.env.MODE;

if (!API_BASE_URL) {
  // Provide a meaningful error for missing configuration during development
  // eslint-disable-next-line no-console
  console.warn("VITE_API_URL is not defined. API requests will fail until it is configured.");
}
