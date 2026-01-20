import { getAccessToken } from "../auth/auth.store";
import { reportAuthFailure } from "@/auth/authEvents";
import { redirectToLogin } from "@/services/api";

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
    redirectToLogin();
  }

  const response = await fetch(input, {
    ...init,
    headers
  });

  if (response.status === 401) {
    reportAuthFailure("unauthorized");
    redirectToLogin();
  }

  return response;
}
