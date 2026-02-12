import { getAccessToken } from "@/lib/authToken";
import { reportAuthFailure } from "@/auth/authEvents";
import { ApiError } from "@/lib/api";

export async function fetchWithAuth(
  input: RequestInfo,
  init: RequestInit = {}
): Promise<Response> {
  const token = getAccessToken();

  if (!token) {
    reportAuthFailure("missing-token");
    throw new ApiError({
      status: 401,
      message: "Missing auth token",
      details: { reason: "missing-token" }
    });
  }

  const headers = new Headers(init.headers);
  headers.set("Authorization", `Bearer ${token}`);

  const response = await fetch(input, {
    ...init,
    headers
  });

  if (response.status === 401) {
    reportAuthFailure("unauthorized");
  }

  return response;
}
