import { useMutation } from "@tanstack/react-query";
import http from "./http";

export function useApiPost<T>(url: string) {
  return useMutation({
    mutationFn: async (payload: any) => {
      const { data } = await http.post<T>(url, payload);
      return data;
    },
  });
}

export function useApiPut<T>(url: string) {
  return useMutation({
    mutationFn: async (payload: any) => {
      const { data } = await http.put<T>(url, payload);
      return data;
    },
  });
}

export function useApiDelete<T>(url: string) {
  return useMutation({
    mutationFn: async () => {
      const { data } = await http.delete<T>(url);
      return data;
    },
  });
}
