import { getToken } from "../lib/storage";

export async function login(email: string, password: string): Promise<string> {
  const res = await fetch(
    `${import.meta.env.VITE_API_URL}/api/auth/login`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    }
  );

  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || "Invalid credentials");
  }

  const data = await res.json();
  return data.token;
}

export function getAuthHeaders() {
  const token = getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}
