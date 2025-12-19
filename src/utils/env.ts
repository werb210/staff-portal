export const API_BASE_URL = (() => {
  const baseUrl = import.meta.env.VITE_API_BASE_URL as string | undefined;

  if (!baseUrl) {
    throw new Error("VITE_API_BASE_URL is not defined. Set it to connect to the Staff Server.");
  }

  return baseUrl;
})();

export const ENV = import.meta.env.MODE;
