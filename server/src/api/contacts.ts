import api from "./client";

const normalizeContact = (contact: any) => {
  if (!contact) return contact;

  const firstName = contact.first_name ?? contact.firstName ?? "";
  const lastName = contact.last_name ?? contact.lastName ?? "";
  const name = contact.name ?? `${firstName} ${lastName}`.trim();

  return {
    ...contact,
    id: contact.id ?? contact.contact_id ?? contact._id ?? contact.contactId,
    name,
    firstName,
    lastName,
    email: contact.email ?? null,
    phone: contact.phone ?? null,
    companyId: contact.company_id ?? contact.companyId ?? null,
    companyName: contact.companyName ?? contact.company_name ?? contact.company ?? null,
  };
};

const normalizeList = (payload: any) => {
  const list = payload?.data ?? payload ?? [];
  return Array.isArray(list) ? list.map(normalizeContact) : [];
};

const toContactPayload = (payload: any) => {
  const name = payload?.name ?? "";
  const [first, ...rest] = name.split(" ");
  const last = rest.join(" ").trim();

  return {
    first_name: payload?.first_name ?? payload?.firstName ?? first || null,
    last_name: payload?.last_name ?? payload?.lastName ?? last || null,
    email: payload?.email ?? null,
    phone: payload?.phone ?? null,
    company_id: payload?.company_id ?? payload?.companyId ?? null,
  };
};

export const ContactsAPI = {
  list: async () => {
    const res = await api.get("/contacts");
    return { ...res.data, data: normalizeList(res.data) };
  },
  search: async (query: string) => {
    const res = await api.get(`/search/contacts?q=${encodeURIComponent(query)}`);
    return { ...res.data, data: normalizeList(res.data) };
  },
  get: async (id: string) => {
    const res = await api.get(`/contacts/${id}`);
    return { ...res.data, data: normalizeContact(res.data?.data ?? res.data) };
  },
  create: async (payload: any) => {
    const res = await api.post("/contacts", toContactPayload(payload));
    return { ...res.data, data: normalizeContact(res.data?.data ?? res.data) };
  },
  update: async (id: string, payload: any) => {
    const res = await api.put(`/contacts/${id}`, toContactPayload(payload));
    return { ...res.data, data: normalizeContact(res.data?.data ?? res.data) };
  },
  delete: async (id: string) => api.delete(`/contacts/${id}`).then((r) => r.data),
};
