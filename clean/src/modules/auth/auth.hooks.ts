import {
  UseQueryOptions,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import { authClient } from "./auth.client";
import { AUTH_QUERY_KEY, AuthUser, Role, authStore, normalizeUser } from "./auth.store";

type LoginVariables = {
  email: string;
  password: string;
};

type LoginResponse = {
  token?: string;
  user?: AuthUser;
};

export function useLogin() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ email, password }: LoginVariables) => {
      const response = await authClient.post("/api/users/login", { email, password });
      const data = response.data as LoginResponse & {
        accessToken?: string;
        jwt?: string;
      };

      const token = data.token ?? data.accessToken ?? data.jwt;
      const userPayload = normalizeUser((data as any).user ?? data);

      if (!token) {
        throw new Error("Login response missing token");
      }

      return { token, user: userPayload };
    },
    onSuccess: ({ token, user }) => {
      authStore.getState().login(token, user);
      queryClient.setQueryData(AUTH_QUERY_KEY, user);
    },
  });
}

export function useLogout() {
  const queryClient = useQueryClient();

  return () => {
    queryClient.removeQueries({ queryKey: AUTH_QUERY_KEY });
    authStore.getState().logout();
  };
}

export function useMe(options?: Partial<UseQueryOptions<AuthUser>>) {
  const token = authStore((state) => state.token);

  return useQuery<AuthUser>({
    queryKey: AUTH_QUERY_KEY,
    queryFn: async () => {
      const response = await authClient.get("/api/users/me");
      const userPayload = normalizeUser((response.data as any).user ?? response.data);
      authStore.getState().setUser(userPayload);
      return userPayload;
    },
    enabled: Boolean(token) && (options?.enabled ?? true),
    staleTime: 5 * 60 * 1000,
    ...options,
  });
}

type GuardedRolesProps = {
  allowedRoles?: Role[];
};

export function useHasRole({ allowedRoles }: GuardedRolesProps) {
  const role = authStore((state) => state.role);
  if (!allowedRoles || allowedRoles.length === 0) return true;
  if (!role) return false;
  return allowedRoles.includes(role);
}
