import contactsRepo from "../db/repositories/contacts.repo";
import companiesRepo from "../db/repositories/companies.repo";

const normalize = (record: any, type: string) => {
  if (!record) return null;
  return {
    id: record.id,
    type,
    ...record,
  };
};

const searchService = {
  async search(query: string) {
    if (!query || typeof query !== "string") return [];

    const filter = { name: query };

    const contacts = await contactsRepo.findMany(filter);
    const companies = await companiesRepo.findMany(filter);

    const mappedContacts = contacts.map((c) => normalize(c, "contact"));
    const mappedCompanies = companies.map((c) => normalize(c, "company"));

    return [...mappedContacts, ...mappedCompanies].filter(Boolean);
  },
};

export default searchService;
