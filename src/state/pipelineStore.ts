// src/state/pipelineStore.ts
import { create } from 'zustand';
import { api } from '../api/client';

export interface PipelineApp {
  id: string;
  businessName: string;
  applicantName: string;
  requestedAmount: number;
  pipelineStage: string;
}

const STAGES = [
  "Not Submitted",
  "Received",
  "In Review",
  "Documents Required",
  "Ready for Signing",
  "Off to Lender",
  "Offer",
];

interface PipelineState {
  stages: Record<string, PipelineApp[]>;
  load: () => Promise<void>;
  move: (appId: string, newStage: string) => Promise<void>;
}

export const usePipelineStore = create<PipelineState>((set, get) => ({
  stages: STAGES.reduce((acc, s) => ({ ...acc, [s]: [] }), {}),

  load: async () => {
    const client = api();
    const res = await client.get('/pipeline/all');

    const grouped = STAGES.reduce((acc, stage) => {
      acc[stage] = res.data.filter((a: any) => a.pipelineStage === stage);
      return acc;
    }, {} as Record<string, PipelineApp[]>);

    set({ stages: grouped });
  },

  move: async (appId, newStage) => {
    const client = api();
    await client.post(`/pipeline/application/${appId}/update`, {
      stage: newStage,
      reason: "Staff drag-and-drop",
    });

    // refresh full pipeline
    await get().load();
  },
}));
