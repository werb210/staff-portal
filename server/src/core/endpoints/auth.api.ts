// server/src/core/endpoints/auth.api.ts
import { http } from "@/lib/http";
import type { User } from "@/types/User";

export interface LoginRequestDTO {
  email: string;
  password: string;
}

export interface LoginResponseDTO {
  token: string;
  user: User;
}

export const authApi = {
  login: async (payload: LoginRequestDTO): Promise<LoginResponseDTO> => {
    const { data } = await http.post<LoginResponseDTO>("/auth/login", payload);
    return data;
  },

  me: async (): Promise<User> => {
    const { data } = await http.get<User>("/auth/me");
    return data;
  },
};
