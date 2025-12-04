import api from "../apiClient";

export const http = {
  get: (url: string) => api.get(url).then(r => r.data),
  post: (url: string, body?: any) => api.post(url, body).then(r => r.data),
  put: (url: string, body?: any) => api.put(url, body).then(r => r.data),
  patch: (url: string, body?: any) => api.patch(url, body).then(r => r.data),
  delete: (url: string) => api.delete(url).then(r => r.data),
};
