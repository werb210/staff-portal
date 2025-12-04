// server/src/hooks/useLogin.ts
import { useMutation } from "@tanstack/react-query";
import { login, LoginRequest, LoginResponse } from "@/api/auth";
import { useAuthStore } from "@/state/authStore";

export function useLogin() {
  const setAuth = useAuthStore((s) => s.setAuth);

  return useMutation<LoginResponse, Error, LoginRequest>({
    mutationFn: (payload) => login(payload),
    onSuccess: (data) => {
      setAuth({ user: data.user, token: data.token });
    },
  });
}
