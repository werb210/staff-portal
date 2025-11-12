import apiClient from '../hooks/api/axiosClient';
import type {
  CRMContact,
  CRMContactAssignmentPayload,
  CRMReminder,
  CRMReminderPayload,
  CRMTask,
  CRMTaskUpdatePayload,
} from '../types/crm';

export const crmService = {
  contacts: async () => (await apiClient.get<CRMContact[]>('/api/crm/contacts')).data,
  tasks: async () => (await apiClient.get<CRMTask[]>('/api/crm/tasks')).data,
  reminders: async () => (await apiClient.get<CRMReminder[]>('/api/crm/follow-ups')).data,
  updateTask: async ({ id, status }: CRMTaskUpdatePayload) =>
    (await apiClient.post(`/api/crm/tasks/${id}/status`, { status })).data,
  scheduleReminder: async (payload: CRMReminderPayload) =>
    (await apiClient.post<CRMReminder>('/api/crm/follow-ups', payload)).data,
  assignContact: async (payload: CRMContactAssignmentPayload) =>
    (await apiClient.post(`/api/crm/contacts/${payload.contactId}/assign`, payload)).data,
};
