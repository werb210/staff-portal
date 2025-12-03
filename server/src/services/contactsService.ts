import contactsRepo from "../db/repositories/contacts.repo";

const contactsService = {
  async create(data: Record<string, unknown>) {
    return contactsRepo.create(data);
  },

  async update(id: string, data: Record<string, unknown>) {
    return contactsRepo.update(id, data);
  },

  async delete(id: string) {
    return contactsRepo.delete(id);
  },

  async findById(id: string) {
    return contactsRepo.findById(id);
  },

  async findMany(filter: Record<string, unknown> = {}) {
    return contactsRepo.findMany(filter);
  },
};

export default contactsService;
