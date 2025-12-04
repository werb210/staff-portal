// server/src/services/contactsService.ts
import contactsRepo from "../db/repositories/contacts.repo.js";

export const contactsService = {
  async list() {
    return contactsRepo.findMany();
  },

  async get(id: string) {
    return contactsRepo.findById(id);
  },

  async create(data: any) {
    return contactsRepo.create(data);
  },

  async update(id: string, data: any) {
    return contactsRepo.update(id, data);
  },

  async remove(id: string) {
    return contactsRepo.delete(id);
  },
};

export default contactsService;
