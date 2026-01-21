import { clearAccessToken, getAccessToken } from "@/lib/authToken";
import { reportAuthFailure } from "@/auth/authEvents";

export async function fetchWithAuth(
  input: RequestInfo,
  init: RequestInit = {}
): Promise<Response> {
  const token = getAccessToken();

  const headers = new Headers(init.headers);
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  } else {
    reportAuthFailure("missing-token");
  }

  const response = await fetch(input, {
    ...init,
    headers
  });

  if (response.status === 401) {
    clearAccessToken();
    reportAuthFailure("unauthorized");
  }

  return response;
}
