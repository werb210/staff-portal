import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { crmService } from '../../services/crmService';
import type {
  CRMContact,
  CRMContactAssignmentPayload,
  CRMReminder,
  CRMReminderPayload,
  CRMTask,
  CRMTaskUpdatePayload,
} from '../../types/crm';
import { useDataStore } from '../../store/dataStore';

const crmQueryOptions = {
  staleTime: 1000 * 30,
  refetchOnWindowFocus: false,
};

export function useCRMContacts() {
  const { setContacts } = useDataStore();
  return useQuery<CRMContact[]>({
    queryKey: ['crm', 'contacts'],
    queryFn: crmService.contacts,
    onSuccess: (contacts) => setContacts(contacts),
    ...crmQueryOptions,
  });
}

export function useCRMTasks() {
  const { setTasks } = useDataStore();
  return useQuery<CRMTask[]>({
    queryKey: ['crm', 'tasks'],
    queryFn: crmService.tasks,
    onSuccess: (tasks) => setTasks(tasks),
    ...crmQueryOptions,
  });
}

export function useCRMReminders() {
  const { setReminders } = useDataStore();
  return useQuery<CRMReminder[]>({
    queryKey: ['crm', 'reminders'],
    queryFn: crmService.reminders,
    onSuccess: (reminders) => setReminders(reminders),
    ...crmQueryOptions,
  });
}

export function useUpdateCRMTask() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CRMTaskUpdatePayload) => crmService.updateTask(payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['crm', 'tasks'] });
    },
  });
}

export function useScheduleReminder() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CRMReminderPayload) => crmService.scheduleReminder(payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['crm', 'reminders'] });
    },
  });
}

export function useAssignContact() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CRMContactAssignmentPayload) => crmService.assignContact(payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['crm', 'contacts'] });
      void queryClient.invalidateQueries({ queryKey: ['crm', 'tasks'] });
    },
  });
}
