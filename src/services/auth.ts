import { buildApiUrl } from "./api";

export type AuthenticatedUser = {
  id: string;
  email: string;
  role: string;
};

export type LoginSuccess = {
  accessToken: string;
  user: AuthenticatedUser;
};

export async function login(email: string, password: string): Promise<LoginSuccess> {
  const res = await fetch(buildApiUrl("/auth/login"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password })
  });

  if (!res.ok) {
    throw new Error("Login failed");
  }

  const data = await res.json();

  return {
    accessToken: data.accessToken,
    user: data.user
  };
}
