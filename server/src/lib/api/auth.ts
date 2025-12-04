import { post } from "./base";

export async function loginRequest(email: string, password: string) {
  const data = await post("/api/auth/login", { email, password });
  // Expected shape: { token, user }
  return {
    token: data.token as string,
    user: data.user
  };
}
