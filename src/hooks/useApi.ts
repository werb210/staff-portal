// src/hooks/useApi.ts
import { useQuery, useMutation } from "@tanstack/react-query";

export const q = {
  get: (key: any[], fn: () => Promise<any>) =>
    useQuery({ queryKey: key, queryFn: fn }),

  post: (fn: (data: any) => Promise<any>) =>
    useMutation({ mutationFn: fn }),
};
