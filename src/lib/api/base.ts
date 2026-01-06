const API_BASE_URL =
  (window as any).__ENV__?.API_BASE_URL ||
  "";

if (!API_BASE_URL) {
  throw new Error("API_BASE_URL is not defined");
}

export async function apiFetch(
  path: string,
  options: RequestInit = {}
) {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {})
    },
    credentials: "include"
  });

  if (!res.ok) {
    throw new Error(`API error ${res.status}`);
  }

  return res.json();
}
