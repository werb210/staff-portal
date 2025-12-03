import companiesRepo from "../db/repositories/companies.repo";
import contactsRepo from "../db/repositories/contacts.repo";

const companiesService = {
  async list() {
    return await companiesRepo.findMany({});
  },

  async get(id: string) {
    return await companiesRepo.findById(id);
  },

  async create(payload: Record<string, any>) {
    return await companiesRepo.create(payload);
  },

  async update(id: string, payload: Record<string, any>) {
    return await companiesRepo.update(id, payload);
  },

  async remove(id: string) {
    return await companiesRepo.delete(id);
  },

  async search(term: string) {
    if (!term) return [];
    return await companiesRepo.findMany({ name: term });
  },

  async getContacts(companyId: string) {
    return await contactsRepo.findMany({ companyId });
  },
};

export default companiesService;
