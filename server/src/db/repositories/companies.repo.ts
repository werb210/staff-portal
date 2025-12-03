export type Company = Record<string, any> & { id?: string };

export const companiesRepo = {
  async findMany(): Promise<Company[]> {
    return [];
  },
  async findById(id: string): Promise<Company | null> {
    return { id } as Company;
  },
  async create(payload: Company): Promise<Company> {
    return { ...payload, id: payload.id ?? `company-${Date.now()}` };
  },
  async update(id: string, payload: Company): Promise<Company> {
    return { ...payload, id };
  },
  async delete(id: string): Promise<boolean> {
    return Boolean(id);
  },
};

export default companiesRepo;
export { companiesRepo };
