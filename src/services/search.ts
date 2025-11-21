import api from "../lib/api";

export const SearchAPI = {
  query: (q: string) => api.get(`/api/search?q=${encodeURIComponent(q)}`)
};
