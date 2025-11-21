import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { UsersAPI } from "../../services";

export function useUsers() {
  return useQuery({
    queryKey: ["users"],
    queryFn: () => UsersAPI.list().then(r => r.data),
  });
}

export function useUser(id: string) {
  return useQuery({
    queryKey: ["users", id],
    queryFn: () => UsersAPI.get(id).then(r => r.data),
    enabled: !!id,
  });
}

export function useCreateUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: any) => UsersAPI.create(body),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["users"] }),
  });
}

export function useUpdateUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, body }: any) => UsersAPI.update(id, body),
    onSuccess: (_, { id }) => {
      qc.invalidateQueries({ queryKey: ["users"] });
      qc.invalidateQueries({ queryKey: ["users", id] });
    },
  });
}

export function useDeleteUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => UsersAPI.remove(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["users"] }),
  });
}
