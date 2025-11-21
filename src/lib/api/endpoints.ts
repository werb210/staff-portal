import api from "./client";

// AUTH
export const AuthAPI = {
  login: (data: { email: string; password: string }) =>
    api.post("/api/auth/login", data),
};

// CONTACTS
export const ContactsAPI = {
  list: (params?: any) => api.get("/api/crm/contacts", { params }),
  get: (id: string) => api.get(`/api/crm/contacts/${id}`),
  create: (data: any) => api.post("/api/crm/contacts", data),
  update: (id: string, data: any) => api.patch(`/api/crm/contacts/${id}`, data),
  remove: (id: string) => api.delete(`/api/crm/contacts/${id}`),
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
