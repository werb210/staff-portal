export function getAuthToken(): string | null {
  return (
    localStorage.getItem("boreal.accessToken") ||
    localStorage.getItem("bf.access") ||
    localStorage.getItem("staff_auth_token")
  );
}

export function decodeJwt(token?: string): any | null {
  if (!token || !token.includes(".")) return null;
  try {
    return JSON.parse(atob(token.split(".")[1]));
  } catch {
    return null;
  }
}
