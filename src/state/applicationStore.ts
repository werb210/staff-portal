// src/state/applicationStore.ts
import { create } from 'zustand';
import { api } from '../api/client';
import { PipelineApp } from './pipelineStore';

interface State {
  application: PipelineApp | null;
  formData: any;
  ocr: any[];
  banking: any;
  documents: any[];
  messages: any[];
  lenders: any[];

  load: (id: string) => Promise<void>;
  reloadChat: () => Promise<void>;
}

export const useApplicationStore = create<State>((set, get) => ({
  application: null,
  formData: null,
  ocr: [],
  banking: null,
  documents: [],
  messages: [],
  lenders: [],

  load: async (id) => {
    const client = api();

    // Basic app info
    const app = await client.get(`/applications/${id}`);
    const docs = await client.get(`/documents/application/${id}`);
    const ocr = await client.get(`/ocr/application/${id}`);
    const bank = await client.get(`/banking/${id}`);
    const chat = await client.get(`/chat/application/${id}`);
    const lenders = await client.get(`/lenders/match/${id}`);

    set({
      application: app.data,
      formData: app.data.formData,
      documents: docs.data,
      ocr: ocr.data,
      banking: bank.data,
      messages: chat.data,
      lenders: lenders.data,
    });

    // Subscribe to WS updates
    const ws = new WebSocket(import.meta.env.VITE_WS_URL);
    ws.onmessage = (msg) => {
      try {
        const data = JSON.parse(msg.data);

        if (data.applicationId !== id) return;

        if (data.type === "message") {
          get().reloadChat();
        }
        if (data.type === "pipeline-update") {
          get().load(id);
        }
        if (data.type === "document") {
          get().load(id);
        }
      } catch (_) {}
    };
  },

  reloadChat: async () => {
    const client = api();
    const appId = get().application?.id;
    if (!appId) return;

    const chat = await client.get(`/chat/application/${appId}`);
    set({ messages: chat.data });
  },
}));
