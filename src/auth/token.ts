import { getAccessToken } from "@/lib/authToken";

export function getAuthToken(): string | null {
  return getAccessToken();
}

export function decodeToken(token?: string) {
  if (!token) {
    throw new Error("Token is undefined");
  }
  return atob(token);
}

export function decodeJwt(token?: string): any | null {
  if (!token || !token.includes(".")) return null;
  try {
    return JSON.parse(decodeToken(token.split(".")[1]));
  } catch {
    return null;
  }
}
