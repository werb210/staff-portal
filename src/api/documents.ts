import { apiClient } from "./client";

export type DocumentRecord = {
  id: string;
  name: string;
  category: string;
  status: string;
  uploadDate?: string;
  size?: number;
  version?: number;
};

export type DocumentPresignResponse = {
  url: string;
  expiresAt: string;
};

export type DocumentVersion = {
  id: string;
  version: number;
  uploadedAt: string;
  size?: number;
  status?: string;
};

export const fetchDocumentPresign = (documentId: string) => apiClient.get<DocumentPresignResponse>(`/documents/${documentId}/presign`);

export const acceptDocument = (documentId: string) => apiClient.patch(`/documents/${documentId}/accept`);

export const rejectDocument = (documentId: string, reason?: string) =>
  apiClient.patch(`/documents/${documentId}/reject`, { reason });

export const restoreDocumentVersion = (documentId: string, version: number) =>
  apiClient.post(`/documents/${documentId}/version/restore`, { version });

export const fetchDocumentVersions = (documentId: string) => apiClient.get<DocumentVersion[]>(`/documents/${documentId}/versions`);
