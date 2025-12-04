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

    if (query.startsWith("company:")) {
      const companyId = query.split(":")[1];
      const result = await contactsRepo.findByCompany(companyId);
      const records = (result as any)?.rows ?? (result as any);
      return Array.isArray(records) ? records : [];
    }

    const filter = query.toLowerCase();

    const contactsResult = await contactsRepo.findAll();
    const companiesResult = await companiesRepo.findAll();

    const contacts = ((contactsResult as any)?.rows ?? contactsResult) as any[];
    const companies = ((companiesResult as any)?.rows ?? companiesResult) as any[];

    const match = (record: any) =>
      JSON.stringify(record).toLowerCase().includes(filter);

    const mappedContacts = contacts.filter(match).map((c) => normalize(c, "contact"));
    const mappedCompanies = companies.filter(match).map((c) => normalize(c, "company"));

    return [...mappedContacts, ...mappedCompanies].filter(Boolean);
  },
};

export default searchService;
