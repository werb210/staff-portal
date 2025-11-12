import { apiClient } from './client';

export type PipelineStatus = 'new' | 'in_review' | 'underwriting' | 'conditions' | 'closing' | 'funded';

export interface PipelineCard {
  id: string;
  applicant: string;
  amount: number;
  status: PipelineStatus;
  updatedAt: string;
  borrowerEmail?: string;
  borrowerPhone?: string;
  financials?: {
    revenue?: number;
    netIncome?: number;
    dscr?: number | string;
  };
  bankAccounts?: Array<{
    id: string;
    institution: string;
    type?: string;
    last4?: string;
    balance?: number;
  }>;
}

export interface PipelineColumn {
  id: string;
  title: string;
  status: PipelineStatus;
  cards: PipelineCard[];
}

export interface PipelineMovePayload {
  applicationId: string;
  fromStage: PipelineStatus;
  toStage: PipelineStatus;
  position: number;
}

const formatTitle = (title: string | undefined, status: PipelineStatus) => {
  if (title) return title;
  return status
    .split('_')
    .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
    .join(' ');
};

export const getPipelineBoards = async (): Promise<PipelineColumn[]> => {
  const { data } = await apiClient.get<PipelineColumn[]>('/pipeline/boards');
  return data.map((column) => ({
    id: column.id,
    title: formatTitle(column.title, column.status),
    status: column.status,
    cards: column.cards ?? [],
  }));
};

export const movePipelineCard = async (payload: PipelineMovePayload): Promise<void> => {
  await apiClient.post('/pipeline/move', payload);
};

export const getPipelineCard = async (id: string): Promise<PipelineCard> => {
  const { data } = await apiClient.get<PipelineCard>(`/pipeline/cards/${id}`);
  return data;
};

export const updatePipelineCard = async (id: string, input: Record<string, unknown>) => {
  const { data } = await apiClient.put(`/pipeline/cards/${id}`, input);
  return data;
};

export const getPipelineDocuments = async (id: string) => {
  const { data } = await apiClient.get(`/pipeline/cards/${id}/documents`);
  return data;
};

export const getPipelineLenders = async (id: string) => {
  const { data } = await apiClient.get(`/pipeline/cards/${id}/lenders`);
  return data;
};

export const getPipelineAISummary = async (id: string) => {
  const { data } = await apiClient.get(`/pipeline/cards/${id}/ai-summary`);
  return data;
};
