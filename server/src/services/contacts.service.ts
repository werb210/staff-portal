import contactsRepo from "../db/repositories/contacts.repo.js";

const contactsService = {
  async list() {
    return contactsRepo.findAll();
  },

  async get(id: string) {
    return contactsRepo.findById(id);
  },

  async create(payload: any) {
    return contactsRepo.create({
      firstName: payload.firstName,
      lastName: payload.lastName,
      email: payload.email,
      phone: payload.phone,
      companyId: payload.companyId,
    });
  },

  async update(id: string, payload: any) {
    return contactsRepo.update(id, {
      firstName: payload.firstName,
      lastName: payload.lastName,
      email: payload.email,
      phone: payload.phone,
      companyId: payload.companyId,
    });
  },

  async remove(id: string) {
    return contactsRepo.delete(id);
  },
};

export default contactsService;
