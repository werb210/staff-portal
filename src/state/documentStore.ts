import { create } from 'zustand';
import { api } from '../api/client';

interface State {
  docs: any[];
  versions: Record<string, any[]>;

  load: (applicationId: string) => Promise<void>;
  preview: (docId: string) => Promise<string>;
  accept: (docId: string) => Promise<void>;
  reject: (docId: string, reason: string) => Promise<void>;
  uploadNewVersion: (docId: string, file: File) => Promise<void>;
  loadVersions: (docId: string) => Promise<void>;
  refresh: (docId: string) => Promise<void>;
}

export const useDocumentStore = create<State>((set, get) => ({
  docs: [],
  versions: {},

  load: async (applicationId) => {
    const client = api();
    const res = await client.get(`/documents/application/${applicationId}`);
    set({ docs: res.data });
  },

  preview: async (docId) => {
    const client = api();
    const res = await client.get(`/documents/${docId}/view`);
    return res.data.sasUrl;
  },

  accept: async (docId) => {
    const client = api();
    await client.post(`/documents/${docId}/accept`);
    return get().refresh(docId);
  },

  reject: async (docId, reason) => {
    const client = api();
    await client.post(`/documents/${docId}/reject`, { reason });
    return get().refresh(docId);
  },

  uploadNewVersion: async (docId, file) => {
    const client = api();
    const form = new FormData();
    form.append('file', file);
    await client.post(`/documents/${docId}/upload-version`, form);
  },

  loadVersions: async (docId) => {
    const client = api();
    const res = await client.get(`/documents/${docId}/versions`);
    set((st) => ({
      versions: { ...st.versions, [docId]: res.data }
    }));
  },

  refresh: async (docId) => {
    const appId = get().docs.find((d) => d.id === docId)?.applicationId;
    if (appId) await get().load(appId);
  }
}));
