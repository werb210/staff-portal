import { http } from "./http";

export function listApplications(params: any = {}) {
  const query = new URLSearchParams(params).toString();
  return http.get(`/api/applications?${query}`);
}

export function getApplication(id: string) {
  return http.get(`/api/applications/${id}`);
}

export function createApplication(data: any) {
  return http.post(`/api/applications`, data);
}

export function updateApplication(id: string, data: any) {
  return http.put(`/api/applications/${id}`, data);
}

export function deleteApplication(id: string) {
  return http.del(`/api/applications/${id}`);
}
