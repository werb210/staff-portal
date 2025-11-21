import api from "@/lib/api/client";

export function listApplications(params: any = {}) {
  return api.get(`/api/applications`, { params }).then((res) => res.data);
}

export function getApplication(id: string) {
  return api.get(`/api/applications/${id}`).then((res) => res.data);
}

export function createApplication(data: any) {
  return api.post(`/api/applications`, data).then((res) => res.data);
}

export function updateApplication(id: string, data: any) {
  return api.put(`/api/applications/${id}`, data).then((res) => res.data);
}

export function deleteApplication(id: string) {
  return api.delete(`/api/applications/${id}`).then((res) => res.data);
}
