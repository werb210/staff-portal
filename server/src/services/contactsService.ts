import { contactsRepo } from "../db/repositories/contacts.repo.js";

export const contactsService = {
  async list() {
    return contactsRepo.getAll();
  },

  async get(id: string) {
    return contactsRepo.getById(id);
  },

  async create(payload: any) {
    return contactsRepo.create(payload);
  },

  async update(id: string, payload: any) {
    return contactsRepo.update(id, payload);
  },

  async remove(id: string) {
    return contactsRepo.delete(id);
  }
};
