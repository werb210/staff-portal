import { login, me } from "@/api/auth";

export type LoginPayload = {
  email: string;
  password: string;
};

export const AuthAPI = {
  login,
  me,
};
