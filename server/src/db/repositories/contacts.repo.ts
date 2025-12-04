import db from "../db.js";
import { contacts } from "../schema/contacts.js";
import { eq } from "drizzle-orm";

export default {
  async create(data: Record<string, any>) {
    const [row] = await db.insert(contacts).values({
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email,
      phone: data.phone || null,
      role: data.role || null,
      companyId: data.companyId || null,
    }).returning();

    return row;
  },

  async update(id: string, data: Record<string, any>) {
    const [row] = await db.update(contacts)
      .set({
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        phone: data.phone || null,
        role: data.role || null,
        companyId: data.companyId || null,
      })
      .where(eq(contacts.id, id))
      .returning();

    return row || null;
  },

  async delete(id: string) {
    const [row] = await db.delete(contacts)
      .where(eq(contacts.id, id))
      .returning();

    return row || null;
  },

  async findById(id: string) {
    const [row] = await db.select()
      .from(contacts)
      .where(eq(contacts.id, id));

    return row || null;
  },

  async findMany() {
    return db.select().from(contacts);
  },
};
