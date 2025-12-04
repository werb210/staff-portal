import companiesRepo from "../db/repositories/companies.repo.js";

const companiesService = {
  async list() {
    return companiesRepo.findAll();
  },

  async get(id: string) {
    return companiesRepo.findById(id);
  },

  async create(payload: any) {
    return companiesRepo.create({
      name: payload.name,
      website: payload.website,
      phone: payload.phone,
      email: payload.email,
    });
  },

  async update(id: string, payload: any) {
    return companiesRepo.update(id, {
      name: payload.name,
      website: payload.website,
      phone: payload.phone,
      email: payload.email,
    });
  },

  async remove(id: string) {
    return companiesRepo.delete(id);
  },
};

export default companiesService;
