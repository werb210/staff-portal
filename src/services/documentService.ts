import apiClient from '../hooks/api/axiosClient';
import type { DocumentRecord, DocumentStatusPayload } from '../types/documents';

export const documentService = {
  list: async () => (await apiClient.get<DocumentRecord[]>('/api/documents')).data,
  updateStatus: async (id: string, payload: DocumentStatusPayload) =>
    (await apiClient.post(`/api/documents/${id}/status`, payload)).data,
};
