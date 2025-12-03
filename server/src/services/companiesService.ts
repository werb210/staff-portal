import companiesRepo from "../db/repositories/companies.repo.js";

export const companiesService = {
  async list() {
    return companiesRepo.findMany();
  },

  async get(id: string) {
    return companiesRepo.findById(id);
  },

  async create(payload: any) {
    return companiesRepo.create(payload);
  },

  async update(id: string, payload: any) {
    return companiesRepo.update(id, payload);
  },

  async remove(id: string) {
    return companiesRepo.delete(id);
  }
};

export default companiesService;
