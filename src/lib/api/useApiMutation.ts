import { useMutation } from "@tanstack/react-query";
import { post, put, del } from "./helpers";

export function usePost<T>(url: string) {
  return useMutation({
    mutationFn: (body: any) => post<T>(url, body),
  });
}

export function usePut<T>(url: string) {
  return useMutation({
    mutationFn: (body: any) => put<T>(url, body),
  });
}

export function useDelete<T>(url: string) {
  return useMutation({
    mutationFn: () => del<T>(url),
  });
}
