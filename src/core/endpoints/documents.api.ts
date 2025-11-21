import apiClient from "../api";

export interface DocumentFilters {
  applicationId?: string;
  type?: string;
  page?: number;
  perPage?: number;
  search?: string;
}

export interface DocumentMetadataPayload {
  title?: string;
  description?: string;
  tags?: string[];
  type?: string;
}

export const listDocuments = <T = unknown>(params?: DocumentFilters) =>
  apiClient.get<T>("/documents", { params });

export const getDocument = <T = unknown>(documentId: string) =>
  apiClient.get<T>(`/documents/${documentId}`);

export const uploadDocument = <T = unknown>(payload: FormData) =>
  apiClient.post<T>("/documents", payload, {
    headers: { "Content-Type": "multipart/form-data" },
  });

export const updateDocumentMetadata = <T = unknown>(documentId: string, payload: DocumentMetadataPayload) =>
  apiClient.patch<T>(`/documents/${documentId}`, payload);

export const deleteDocument = <T = unknown>(documentId: string) =>
  apiClient.delete<T>(`/documents/${documentId}`);

export const downloadDocument = (documentId: string) =>
  apiClient.get<Blob>(`/documents/${documentId}/download`, { responseType: "blob" });
