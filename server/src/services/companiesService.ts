// server/src/services/companiesService.ts
import CompaniesRepo from "../db/repositories/companies.repo";

export const CompaniesService = {
  async list() {
    return CompaniesRepo.findAll();
  },

  async get(id: string) {
    return CompaniesRepo.findById(id);
  },

  async create(data: { name: string; website?: string; phone?: string }) {
    return CompaniesRepo.create(data);
  },

  async update(id: string, data: Partial<{ name: string; website: string; phone: string }>) {
    return CompaniesRepo.update(id, data);
  },

  async delete(id: string) {
    return CompaniesRepo.remove(id);
  },
};

export default CompaniesService;
