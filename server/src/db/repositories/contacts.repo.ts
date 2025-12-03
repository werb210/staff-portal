import db from "../db.js";
import { contacts } from "../schema/contacts.js";
import { eq } from "drizzle-orm";
import { safeDetails } from "../../utils/safeDetails.js";

export const contactsRepo = {
  async create(data: any) {
    const [created] = await db.insert(contacts).values({
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email,
      phone: data.phone,
      companyId: data.companyId
    }).returning();
    return created;
  },

  async update(id: string, data: any) {
    const [updated] = await db.update(contacts)
      .set({
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        phone: data.phone,
        companyId: data.companyId
      })
      .where(eq(contacts.id, id))
      .returning();
    return updated;
  },

  async delete(id: string) {
    const [removed] = await db.delete(contacts)
      .where(eq(contacts.id, id))
      .returning();
    return removed;
  },

  async findById(id: string) {
    const [row] = await db.select().from(contacts).where(eq(contacts.id, id));
    return row || null;
  },

  async findMany(filter: any = {}) {
    const safeFilter = safeDetails(filter);

    if (safeFilter.companyId) {
      return await db.select().from(contacts)
        .where(eq(contacts.companyId, safeFilter.companyId as string));
    }
    return await db.select().from(contacts);
  }
};

export default contactsRepo;
