import { apiClient } from './config';
import type { Company, Contact, Task } from '../utils/types';

export async function getContacts(): Promise<Contact[]> {
  const { data } = await apiClient.get<Contact[]>('/crm/contacts');
  return data;
}

export async function createContact(payload: Partial<Contact>): Promise<Contact> {
  const { data } = await apiClient.post<Contact>('/crm/contacts', payload);
  return data;
}

export async function getCompanies(): Promise<Company[]> {
  const { data } = await apiClient.get<Company[]>('/crm/companies');
  return data;
}

export async function createCompany(payload: Partial<Company>): Promise<Company> {
  const { data } = await apiClient.post<Company>('/crm/companies', payload);
  return data;
}

export async function getTasks(): Promise<Task[]> {
  const { data } = await apiClient.get<Task[]>('/crm/tasks');
  return data;
}

export async function createTask(payload: Partial<Task>): Promise<Task> {
  const { data } = await apiClient.post<Task>('/crm/tasks', payload);
  return data;
}
