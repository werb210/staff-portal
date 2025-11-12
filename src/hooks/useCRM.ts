import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useCachedQuery } from './useCachedQuery';
import {
  createCompany,
  createContact,
  createTask,
  getCompanies,
  getContacts,
  getTasks
} from '../api/crm';
import type { Company, Contact, Task } from '../utils/types';

export function useContacts() {
  return useCachedQuery<Contact[]>(['crm', 'contacts'], getContacts, 'crm-contacts');
}

export function useCompanies() {
  return useCachedQuery<Company[]>(['crm', 'companies'], getCompanies, 'crm-companies');
}

export function useTasks() {
  return useCachedQuery<Task[]>(['crm', 'tasks'], getTasks, 'crm-tasks');
}

export function useCreateContact() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createContact,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['crm', 'contacts'] });
    }
  });
}

export function useCreateCompany() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createCompany,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['crm', 'companies'] });
    }
  });
}

export function useCreateTask() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createTask,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['crm', 'tasks'] });
    }
  });
}

export type { Company, Contact, Task };
