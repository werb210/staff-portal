export function getApiBaseUrl(): string {
  const url =
    (window as any).__VITE_API_BASE_URL__ ||
    (import.meta as any)?.env?.VITE_API_BASE_URL ||
    (import.meta as any)?.env?.VITE_STAFF_API_URL;

  if (!url) {
    throw new Error(
      "VITE_API_BASE_URL is not defined. Staff Portal cannot connect to Staff Server."
    );
  }

  return url.replace(/\/$/, "");
}
