import { api } from "@/lib/apiClient";

export const searchApi = {
  run: (query: string) => api.get(`/search?q=${encodeURIComponent(query)}`)
};
