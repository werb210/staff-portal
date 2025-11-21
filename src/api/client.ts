const API_BASE =
  import.meta.env.VITE_API_URL ||
  "https://boreal-staff-server-e4hmaqbkb2g5hgfv.canadacentral-01.azurewebsites.net";

export async function api(path: string, options: RequestInit = {}) {
  const token = localStorage.getItem("token");

  const headers = {
    ...(options.body instanceof FormData ? {} : { "Content-Type": "application/json" }),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers || {}),
  } as HeadersInit;

  const res = await fetch(API_BASE + path, { ...options, headers });

  // Auto logout on 401
  if (res.status === 401 || res.status === 403) {
    localStorage.removeItem("token");
    window.location.href = "/login";
    return;
  }

  // Handle raw body for file downloads, etc.
  const contentType = res.headers.get("content-type") || "";

  if (!contentType.includes("application/json")) {
    return res;
  }

  const json = await res.json();

  if (!res.ok) {
    throw new Error(json?.message || "API request failed");
  }

  return json;
}
