import { getAccessToken } from "../auth/auth.store";

export async function fetchWithAuth(
  input: RequestInfo,
  init: RequestInit = {}
): Promise<Response> {
  const token = getAccessToken();

  const headers = new Headers(init.headers);
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const response = await fetch(input, {
    ...init,
    headers,
    credentials: "include",
  });

  // IMPORTANT:
  // Do NOT redirect on 401 here.
  // Let pages/components decide how to handle it.
  return response;
}
