// server/src/lib/http.ts

const API_BASE =
  window.location.hostname.includes("localhost") ||
  window.location.hostname.includes("127.0.0.1")
    ? "http://localhost:5000/api"
    : "https://boreal-staff-server.azurewebsites.net/api";

export async function apiRequest(path: string, options: RequestInit = {}) {
  const token = localStorage.getItem("bf_token");

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {})
  };

  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers,
  });

  // auto logout on unauthorized
  if (res.status === 401) {
    localStorage.removeItem("bf_token");
    window.location.href = "/login";
  }

  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || `HTTP ${res.status}`);
  }

  return res.json();
}
