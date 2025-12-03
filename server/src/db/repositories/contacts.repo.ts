import { eq } from "drizzle-orm";
import db from "../db.js";
import { contacts } from "../schema/contacts.js";

export type ContactRecord = typeof contacts.$inferSelect;
export type CreateContact = typeof contacts.$inferInsert;

export const contactsRepo = {
  async getAll(): Promise<ContactRecord[]> {
    return db.select().from(contacts);
  },

  async getById(id: string): Promise<ContactRecord | undefined> {
    const [record] = await db.select().from(contacts).where(eq(contacts.id, id));
    return record;
  },

  async create(data: CreateContact) {
    const [row] = await db.insert(contacts).values(data).returning();
    return row;
  },

  async update(id: string, data: Partial<ContactRecord>) {
    const [row] = await db.update(contacts).set(data).where(eq(contacts.id, id)).returning();
    return row;
  },

  async delete(id: string) {
    return db.delete(contacts).where(eq(contacts.id, id)).execute();
  },
};

export default contactsRepo;
