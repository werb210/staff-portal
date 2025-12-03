import db from "../db.js";
import { contacts } from "../schema/contacts.js";
import { eq } from "drizzle-orm";
import { safeDetails } from "../../utils/safeDetails.js";

type ContactInput = Record<string, any>;

const buildValues = (data: ContactInput) => {
  const values: Record<string, any> = {};

  if (data.firstName !== undefined) values.firstName = data.firstName;
  if (data.lastName !== undefined) values.lastName = data.lastName;
  if (data.email !== undefined) values.email = data.email;
  if (data.phone !== undefined) values.phone = data.phone;
  if (data.companyId !== undefined) values.companyId = data.companyId;

  return values;
};

export const contactsRepo = {
  async create(data: ContactInput) {
    const payload = buildValues(data);
    const [created] = await db.insert(contacts).values(payload).returning();
    return created;
  },

  async update(id: string, data: ContactInput) {
    const payload = buildValues(data);
    if (Object.keys(payload).length === 0) return this.findById(id);
    const [updated] = await db
      .update(contacts)
      .set(payload)
      .where(eq(contacts.id, id))
      .returning();

    return updated ?? null;
  },

  async delete(id: string) {
    const [removed] = await db
      .delete(contacts)
      .where(eq(contacts.id, id))
      .returning();

    return removed ?? null;
  },

  async findById(id: string) {
    const [row] = await db.select().from(contacts).where(eq(contacts.id, id));
    return row ?? null;
  },

  async findMany(filter: ContactInput = {}) {
    const safeFilter = safeDetails(filter);
    let query: any = db.select().from(contacts);

    if (safeFilter.companyId) {
      query = query.where(eq(contacts.companyId, safeFilter.companyId));
    }

    const rows = await query;
    return rows;
  },
};

export default contactsRepo;
