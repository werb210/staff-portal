import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  createContact,
  deleteContact,
  getContact,
  getContacts,
  getContactTimeline,
  updateContact,
  type Contact,
  type ContactInput,
} from '../api/contacts';

const CONTACTS_KEY = ['contacts'];

export const useContactsList = () =>
  useQuery({
    queryKey: CONTACTS_KEY,
    queryFn: getContacts,
  });

export const useContactDetails = (id: string | null) =>
  useQuery({
    queryKey: [...CONTACTS_KEY, id],
    queryFn: () => getContact(id as string),
    enabled: Boolean(id),
  });

export const useContactTimeline = (id: string | null) =>
  useQuery({
    queryKey: [...CONTACTS_KEY, id, 'timeline'],
    queryFn: () => getContactTimeline(id as string),
    enabled: Boolean(id),
  });

export const useContacts = () => {
  const queryClient = useQueryClient();

  const listQuery = useContactsList();

  const createMutation = useMutation({
    mutationFn: createContact,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: CONTACTS_KEY }),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, input }: { id: string; input: ContactInput }) => updateContact(id, input),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: CONTACTS_KEY });
      queryClient.invalidateQueries({ queryKey: [...CONTACTS_KEY, variables.id] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteContact,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: CONTACTS_KEY }),
  });

  return {
    listQuery,
    createMutation,
    updateMutation,
    deleteMutation,
  };
};

export type { Contact };
