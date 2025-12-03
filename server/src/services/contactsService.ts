// server/src/services/contactsService.ts
// Service layer for contacts. Thin wrapper around the repository.

import contactsRepo from "../db/repositories/contacts.repo";

export async function createContact(data: any) {
  return contactsRepo.create(data);
}

export async function listContacts() {
  return contactsRepo.list();
}

export async function getContact(id: string) {
  return contactsRepo.findById(id);
}

export async function updateContact(id: string, data: any) {
  return contactsRepo.update(id, data);
}

export async function deleteContact(id: string) {
  return contactsRepo.remove(id);
}

export default {
  createContact,
  listContacts,
  getContact,
  updateContact,
  deleteContact,
};
