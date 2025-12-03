export type Product = Record<string, any> & { id?: string };

export const productsRepo = {
  async findMany(): Promise<Product[]> {
    return [];
  },
  async findById(id: string): Promise<Product | null> {
    return { id } as Product;
  },
  async create(payload: Product): Promise<Product> {
    return { ...payload, id: payload.id ?? `product-${Date.now()}` };
  },
  async update(id: string, payload: Product): Promise<Product> {
    return { ...payload, id };
  },
  async delete(id: string): Promise<boolean> {
    return Boolean(id);
  },
};

export default productsRepo;
export { productsRepo };
