import api from "@/lib/api/client";

export const SearchAPI = {
  query: (q: string) => api.get(`/api/search?q=${encodeURIComponent(q)}`)
};
