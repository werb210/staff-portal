import api from "./client";

const normalizeCompany = (company: any) => {
  if (!company) return company;

  return {
    ...company,
    id: company.id ?? company.company_id ?? company.companyId ?? company._id,
    name: company.name ?? "",
    email: company.email ?? company.email_address ?? company.emailAddress ?? null,
    phone: company.phone ?? company.phone_number ?? company.phoneNumber ?? null,
    industry: company.industry ?? company.industry_type ?? company.sector ?? "",
    website: company.website ?? company.url ?? null,
  };
};

const normalizeList = (payload: any) => {
  const list = payload?.data ?? payload ?? [];
  return Array.isArray(list) ? list.map(normalizeCompany) : [];
};

export const CompaniesAPI = {
  list: async () => {
    const res = await api.get("/companies");
    return { ...res.data, data: normalizeList(res.data) };
  },
  search: async (q: string) => {
    const res = await api.get(`/search/companies?q=${encodeURIComponent(q)}`);
    return { ...res.data, data: normalizeList(res.data) };
  },
  get: async (id: string) => {
    const res = await api.get(`/companies/${id}`);
    return { ...res.data, data: normalizeCompany(res.data?.data ?? res.data) };
  },
  create: async (payload: any) => {
    const res = await api.post("/companies", payload);
    return { ...res.data, data: normalizeCompany(res.data?.data ?? res.data) };
  },
  update: async (id: string, payload: any) => {
    const res = await api.put(`/companies/${id}`, payload);
    return { ...res.data, data: normalizeCompany(res.data?.data ?? res.data) };
  },
  delete: async (id: string) => api.delete(`/companies/${id}`).then((r) => r.data),
};
