import { create } from 'zustand';
import type { ApplicationSummary } from '../types/applications';
import type { DocumentRecord } from '../types/documents';
import type { Lender, LenderProduct } from '../types/lenders';
import type { PipelineStage } from '../types/pipeline';
import type { CommunicationThread } from '../types/communication';

type MarketingDashboard = {
  id: string;
  title: string;
  value: number;
  trend: 'up' | 'down' | 'flat';
  description: string;
};

interface DataState {
  applications: ApplicationSummary[];
  documents: DocumentRecord[];
  lenders: Lender[];
  lenderProducts: LenderProduct[];
  pipelineStages: PipelineStage[];
  communicationThreads: CommunicationThread[];
  marketingDashboards: MarketingDashboard[];
  setApplications: (data: ApplicationSummary[]) => void;
  setDocuments: (data: DocumentRecord[]) => void;
  setLenders: (data: Lender[]) => void;
  setLenderProducts: (data: LenderProduct[]) => void;
  setPipelineStages: (data: PipelineStage[]) => void;
  setCommunicationThreads: (data: CommunicationThread[]) => void;
  addCommunicationThread: (thread: CommunicationThread) => void;
  setMarketingDashboards: (data: MarketingDashboard[]) => void;
}

const defaultDashboards: MarketingDashboard[] = [
  { id: 'lead-volume', title: 'Lead Volume', value: 0, trend: 'flat', description: 'Inbound leads this week' },
  { id: 'conversion-rate', title: 'Conversion Rate', value: 0, trend: 'flat', description: 'Applications converted to funded' },
  { id: 'campaign-performance', title: 'Campaign ROI', value: 0, trend: 'flat', description: 'Aggregated marketing campaign results' },
];

export const useDataStore = create<DataState>((set) => ({
  applications: [],
  documents: [],
  lenders: [],
  lenderProducts: [],
  pipelineStages: [],
  communicationThreads: [],
  marketingDashboards: defaultDashboards,
  setApplications: (data) => set({ applications: data }),
  setDocuments: (data) => set({ documents: data }),
  setLenders: (data) => set({ lenders: data }),
  setLenderProducts: (data) => set({ lenderProducts: data }),
  setPipelineStages: (data) => set({ pipelineStages: data }),
  setCommunicationThreads: (data) => set({ communicationThreads: data }),
  addCommunicationThread: (thread) =>
    set((state) => ({ communicationThreads: [...state.communicationThreads, thread] })),
  setMarketingDashboards: (data) => set({ marketingDashboards: data }),
}));

export type { MarketingDashboard };
