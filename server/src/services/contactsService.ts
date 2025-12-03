import contactsRepo from "../db/repositories/contacts.repo";

const contactsService = {
  async list() {
    return await contactsRepo.findMany({});
  },

  async get(id: string) {
    return await contactsRepo.findById(id);
  },

  async create(payload: Record<string, any>) {
    return await contactsRepo.create(payload);
  },

  async update(id: string, payload: Record<string, any>) {
    return await contactsRepo.update(id, payload);
  },

  async remove(id: string) {
    return await contactsRepo.delete(id);
  },

  async search(term: string) {
    if (!term) return [];
    return await contactsRepo.findMany({ name: term });
  },
};

export default contactsService;
