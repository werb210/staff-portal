import { getAccessToken } from "@/auth/auth.store";

export function getAuthToken(): string | null {
  return getAccessToken();
}

export function decodeJwt(token?: string): any | null {
  if (!token || !token.includes(".")) return null;
  try {
    return JSON.parse(atob(token.split(".")[1]));
  } catch {
    return null;
  }
}
