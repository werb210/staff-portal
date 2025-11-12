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
import { useEffect } from 'react';

const crmQueryOptions = {
  staleTime: 1000 * 30,
  refetchOnWindowFocus: false,
};

export function useCRMContacts() {
  const { setContacts } = useDataStore();
  const query = useQuery<CRMContact[]>({
    queryKey: ['crm', 'contacts'],
    queryFn: crmService.contacts,
    ...crmQueryOptions,
  });
  useEffect(() => {
    if (query.data) {
      setContacts(query.data);
    }
  }, [query.data, setContacts]);

  return query;
}

export function useCRMTasks() {
  const { setTasks } = useDataStore();
  const query = useQuery<CRMTask[]>({
    queryKey: ['crm', 'tasks'],
    queryFn: crmService.tasks,
    ...crmQueryOptions,
  });
  useEffect(() => {
    if (query.data) {
      setTasks(query.data);
    }
  }, [query.data, setTasks]);

  return query;
}

export function useCRMReminders() {
  const { setReminders } = useDataStore();
  const query = useQuery<CRMReminder[]>({
    queryKey: ['crm', 'reminders'],
    queryFn: crmService.reminders,
    ...crmQueryOptions,
  });
  useEffect(() => {
    if (query.data) {
      setReminders(query.data);
    }
  }, [query.data, setReminders]);

  return query;
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
