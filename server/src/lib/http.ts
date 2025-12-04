export function jsonHeaders(token?: string): Record<string, string> {
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {})
  };
}

export async function httpGet<T>(url: string, token?: string): Promise<T> {
  const res = await fetch(url, { headers: jsonHeaders(token) });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function httpPost<T>(url: string, body: any, token?: string): Promise<T> {
  const res = await fetch(url, {
    method: "POST",
    headers: jsonHeaders(token),
    body: JSON.stringify(body)
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function httpPatch<T>(url: string, body: any, token?: string): Promise<T> {
  const res = await fetch(url, {
    method: "PATCH",
    headers: jsonHeaders(token),
    body: JSON.stringify(body)
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function httpDelete<T>(url: string, token?: string): Promise<T> {
  const res = await fetch(url, {
    method: "DELETE",
    headers: jsonHeaders(token)
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}
