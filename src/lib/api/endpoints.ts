import api from "./client";

// AUTH
export const AuthAPI = {
  login: (data: { email: string; password: string }) =>
    api.post("/api/auth/login", data),
  me: () => api.get("/api/auth/me"),
};

// CONTACTS
export const ContactsAPI = {
  list: () => api.get("/api/contacts"),
  get: (id: string) => api.get(`/api/contacts/${id}`),
  create: (data: any) => api.post("/api/contacts", data),
  update: (id: string, data: any) => api.put(`/api/contacts/${id}`, data),
  remove: (id: string) => api.delete(`/api/contacts/${id}`),
};

// COMPANIES
export const CompaniesAPI = {
  list: () => api.get("/api/companies"),
  get: (id: string) => api.get(`/api/companies/${id}`),
  create: (data: any) => api.post("/api/companies", data),
  update: (id: string, data: any) => api.put(`/api/companies/${id}`, data),
  remove: (id: string) => api.delete(`/api/companies/${id}`),
};

// DEALS / PIPELINE
export const DealsAPI = {
  list: () => api.get("/api/deals"),
  get: (id: string) => api.get(`/api/deals/${id}`),
  create: (data: any) => api.post("/api/deals", data),
  update: (id: string, data: any) => api.put(`/api/deals/${id}`, data),
  moveStage: (id: string, stage: string) =>
    api.post(`/api/deals/${id}/move`, { stage }),
};

// TAGS
export const TagsAPI = {
  list: () => api.get("/api/tags"),
  create: (data: any) => api.post("/api/tags", data),
  remove: (id: string) => api.delete(`/api/tags/${id}`),
};

// SEARCH
export const SearchAPI = {
  global: (query: string) => api.get(`/api/search?q=${query}`),
};
