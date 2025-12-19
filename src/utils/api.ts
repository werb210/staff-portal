const runtimeEnv =
  typeof window !== "undefined" && (window as any).__ENV__
    ? (window as any).__ENV__
    : {};

const API_BASE =
  runtimeEnv.VITE_API_BASE_URL ||
  runtimeEnv.VITE_STAFF_API_URL ||
  "";

if (!API_BASE) {
  console.error("API BASE URL MISSING — Staff Portal cannot reach Staff Server");
}

function normalize(path: string) {
  if (!path.startsWith("/")) path = "/" + path;
  if (!path.startsWith("/api/")) path = "/api" + path;
  return path;
}

export async function apiFetch<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE}${normalize(path)}`;

  const res = await fetch(url, {
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {})
    },
    ...options
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`API ${res.status}: ${text}`);
  }

  return res.json();
}

export async function checkStaffServerHealth() {
  return apiFetch<unknown>("/health");
}
