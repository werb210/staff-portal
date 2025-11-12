import apiClient from '../hooks/api/axiosClient';

export interface EscalationPayload {
  subject: string;
  transcript?: string;
}

export interface IssueReportPayload {
  summary: string;
  details?: string;
}

export const assistantService = {
  escalateToHuman: async (payload: EscalationPayload) =>
    (await apiClient.post('/api/support/escalate', payload)).data,
  reportIssue: async (payload: IssueReportPayload) =>
    (await apiClient.post('/api/support/report-issue', payload)).data,
};
