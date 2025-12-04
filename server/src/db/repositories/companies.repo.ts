import db from "../db.js";

export interface Company {
  id: string;
  name: string;
  website: string | null;
  phone: string | null;
  email: string | null;
  createdAt: Date;
  updatedAt: Date;
}

const companiesRepo = {
  async findAll(): Promise<Company[]> {
    return db.selectFrom("companies").selectAll().execute();
  },

  async findById(id: string): Promise<Company | null> {
    const rows = await db
      .selectFrom("companies")
      .selectAll()
      .where("id", "=", id)
      .execute();

    return rows.length ? rows[0] : null;
  },

  async create(data: Partial<Company>): Promise<Company> {
    const row = await db
      .insertInto("companies")
      .values({
        name: data.name ?? "",
        website: data.website ?? null,
        phone: data.phone ?? null,
        email: data.email ?? null,
      })
      .returningAll()
      .executeTakeFirst();

    return row as Company;
  },

  async update(id: string, data: Partial<Company>): Promise<Company | null> {
    const updated = await db
      .updateTable("companies")
      .set({
        name: data.name,
        website: data.website,
        phone: data.phone,
        email: data.email,
      })
      .where("id", "=", id)
      .returningAll()
      .executeTakeFirst();

    return updated ?? null;
  },

  async delete(id: string): Promise<boolean> {
    const result = await db
      .deleteFrom("companies")
      .where("id", "=", id)
      .executeTakeFirst();

    return Boolean(result.numDeletedRows);
  },
};

export default companiesRepo;
