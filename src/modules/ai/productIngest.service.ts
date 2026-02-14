import { embedAndStore, type QueryableDb } from "./knowledge.service";

type LenderProductRow = {
  id: string;
  name: string;
  type: string;
  min_amount: number | null;
  max_amount: number | null;
  rate_range: string | null;
  term_range: string | null;
  best_for: string | null;
  industry_fit: string | null;
};

export async function ingestAllProducts(db: QueryableDb) {
  const products = await db.query("SELECT * FROM lender_products");

  for (const product of products.rows as LenderProductRow[]) {
    const content = `
Product: ${product.name}
Type: ${product.type}
Min Amount: ${product.min_amount}
Max Amount: ${product.max_amount}
Rate Range: ${product.rate_range}
Term: ${product.term_range}
Best For: ${product.best_for}
Industry Fit: ${product.industry_fit}
`;

    await embedAndStore(db, content, "product", product.id);
  }
}
