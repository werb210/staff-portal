import { useMutation } from "@tanstack/react-query";
import { post } from "@/lib/api/helpers";
import { useAuthStore } from "@/lib/auth/useAuthStore";

interface LoginResponse {
  token: string;
  user: {
    id: string;
    email: string;
    role: string;
  };
}

export function useLogin() {
  const loginStore = useAuthStore();

  return useMutation({
    mutationFn: (data: { email: string; password: string }) =>
      post<LoginResponse>("/api/auth/login", data),

    onSuccess: (res) => {
      loginStore.setAuth(res.token, res.user);
    },
  });
}
