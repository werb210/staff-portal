// src/pipeline/api/documentsApi.ts
import { api } from "../../api/client";

export const documentsApi = {
  list: async (applicationId: string) => {
    const res = await api.get(`/documents/${applicationId}`);
    return res.data;
  },

  upload: async (applicationId: string, file: File, category: string) => {
    const form = new FormData();
    form.append("file", file);
    form.append("category", category);

    const res = await api.post(`/documents/${applicationId}/upload`, form, {
      headers: { "Content-Type": "multipart/form-data" },
    });

    return res.data;
  },

  accept: async (documentId: string) => {
    const res = await api.post(`/documents/${documentId}/accept`);
    return res.data;
  },

  reject: async (documentId: string, reason: string) => {
    const res = await api.post(`/documents/${documentId}/reject`, {
      reason,
    });
    return res.data;
  },

  downloadUrl: async (documentId: string) => {
    const res = await api.get(`/documents/${documentId}/download-url`);
    return res.data;
  },
};
