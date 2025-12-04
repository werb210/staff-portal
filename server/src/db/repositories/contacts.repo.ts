import db from "../db.js";

export interface Contact {
  id: string;
  firstName: string;
  lastName: string;
  email: string | null;
  phone: string | null;
  companyId: string | null;
  createdAt: Date;
  updatedAt: Date;
}

const contactsRepo = {
  async findAll(): Promise<Contact[]> {
    return db.selectFrom("contacts").selectAll().execute();
  },

  async findById(id: string): Promise<Contact | null> {
    const rows = await db
      .selectFrom("contacts")
      .selectAll()
      .where("id", "=", id)
      .execute();

    return rows.length ? rows[0] : null;
  },

  async create(data: Partial<Contact>): Promise<Contact> {
    const rows = await db
      .insertInto("contacts")
      .values({
        firstName: data.firstName ?? null,
        lastName: data.lastName ?? null,
        email: data.email ?? null,
        phone: data.phone ?? null,
        companyId: data.companyId ?? null,
      })
      .returningAll()
      .executeTakeFirst();

    return rows as Contact;
  },

  async update(id: string, data: Partial<Contact>): Promise<Contact | null> {
    const updated = await db
      .updateTable("contacts")
      .set({
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        phone: data.phone,
        companyId: data.companyId,
      })
      .where("id", "=", id)
      .returningAll()
      .executeTakeFirst();

    return updated ?? null;
  },

  async delete(id: string): Promise<boolean> {
    const result = await db
      .deleteFrom("contacts")
      .where("id", "=", id)
      .executeTakeFirst();

    return Boolean(result.numDeletedRows);
  },
};

export default contactsRepo;
