import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createContact,
  deleteContact,
  getContact,
  getContacts,
  getContactTimeline,
  updateContact,
  type Contact,
  type ContactInput,
} from "../api/contacts";

const CONTACTS_KEY = ["contacts"];

/**
 * Load list of contacts
 * Backend returns: { data: Contact[] }
 */
export const useContactsList = () =>
  useQuery({
    queryKey: CONTACTS_KEY,
    queryFn: async () => {
      const res = await getContacts();
      return res; // normalized in API client
    },
  });

/**
 * Load single contact
 */
export const useContactDetails = (id: string | null) =>
  useQuery({
    queryKey: [...CONTACTS_KEY, id],
    queryFn: async () => {
      if (!id) throw new Error("Missing contact id");
      return getContact(id);
    },
    enabled: Boolean(id),
  });

/**
 * Contact timeline
 */
export const useContactTimeline = (id: string | null) =>
  useQuery({
    queryKey: [...CONTACTS_KEY, id, "timeline"],
    queryFn: async () => {
      if (!id) throw new Error("Missing contact id");
      return getContactTimeline(id);
    },
    enabled: Boolean(id),
  });

/**
 * Create, update, delete contacts
 */
export const useContacts = () => {
  const queryClient = useQueryClient();
  const listQuery = useContactsList();

  const createMutation = useMutation({
    mutationFn: (input: ContactInput) => createContact(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CONTACTS_KEY });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, input }: { id: string; input: ContactInput }) =>
      updateContact(id, input),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: CONTACTS_KEY });
      queryClient.invalidateQueries({
        queryKey: [...CONTACTS_KEY, variables.id],
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteContact(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CONTACTS_KEY });
    },
  });

  return {
    listQuery,
    createMutation,
    updateMutation,
    deleteMutation,
  };
};

export type { Contact };
