export async function biFetch(path: string, options?: RequestInit) {
  const res = await fetch(`/api/bi${path}`, {
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...(options?.headers || {})
    },
    ...options
  });

  if (!res.ok) {
    throw new Error(`BI API Error: ${res.status}`);
  }

  return res.json();
}
