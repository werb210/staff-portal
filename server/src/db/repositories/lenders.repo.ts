export type Lender = Record<string, any> & { id?: string };

const lendersRepo = {
  async findMany(): Promise<Lender[]> {
    return [];
  },
};

export default lendersRepo;
export { lendersRepo };
