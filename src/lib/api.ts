const API_URL = import.meta.env.VITE_API_URL;

export async function api(path: string, options: RequestInit = {}) {
  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`API ${res.status}: ${body}`);
  }

  return res.json();
}

export const backend = {
  health: () => api("/api/_int/health"),
  login: (data: { email: string; password: string }) =>
    api("/api/auth/login", {
      method: "POST",
      body: JSON.stringify(data),
    }),
};
