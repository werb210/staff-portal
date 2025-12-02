// src/hooks/useContacts.ts
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiClient } from "../lib/apiClient";
import { queryClient } from "../lib/queryClient";

export type Contact = {
  id: string;
  name?: string;
  email?: string;
  phone?: string;
  createdAt?: string;
  [key: string]: any;
};

export function useContacts() {
  return useQuery<Contact[]>({
    queryKey: ["contacts"],
    queryFn: async () => {
      const res = await apiClient.get("/api/crm/contacts");
      return res.data?.data || [];
    },
    staleTime: 60000,
  });
}

export function useCreateContact() {
  return useMutation({
    mutationFn: async (data: Partial<Contact>) => {
      const res = await apiClient.post("/api/crm/contacts", data);
      return res.data?.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["contacts"] });
    },
  });
}

export function useUpdateContact() {
  return useMutation({
    mutationFn: async (payload: { id: string; data: Partial<Contact> }) => {
      const res = await apiClient.put(
        `/api/crm/contacts/${payload.id}`,
        payload.data
      );
      return res.data?.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["contacts"] });
    },
  });
}

export function useDeleteContact() {
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await apiClient.delete(`/api/crm/contacts/${id}`);
      return res.data?.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["contacts"] });
    },
  });
}
