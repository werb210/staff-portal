import api from "@/lib/api/client";

export function uploadDocument(applicationId: string, file: File, category: string) {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("category", category);

  return api
    .post(`/api/documents/${applicationId}`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    })
    .then((res) => res.data);
}

export function listDocuments(applicationId: string) {
  return api.get(`/api/documents/${applicationId}`).then((res) => res.data);
}

export function deleteDocument(id: string) {
  return api.delete(`/api/documents/item/${id}`).then((res) => res.data);
}

export function getDocumentPreviewUrl(id: string) {
  return `${import.meta.env.VITE_API_URL}/api/documents/view/${id}`;
}
