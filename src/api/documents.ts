import { http } from "./http";

export function uploadDocument(applicationId: string, file: File, category: string) {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("category", category);

  return http.post(`/api/documents/${applicationId}`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
}

export function listDocuments(applicationId: string) {
  return http.get(`/api/documents/${applicationId}`);
}

export function deleteDocument(id: string) {
  return http.del(`/api/documents/item/${id}`);
}

export function getDocumentPreviewUrl(id: string) {
  return `${import.meta.env.VITE_API_URL}/api/documents/view/${id}`;
}
