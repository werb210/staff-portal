import db from "../db.js";
import { users } from "../schema/users.js";
import { eq } from "drizzle-orm";
import { safeDetails } from "../../utils/safeDetails.js";

export const usersRepo = {
  async create(data: any) {
    const [created] = await db.insert(users).values({
      email: data.email,
      passwordHash: data.passwordHash,
      role: data.role
    }).returning();
    return created;
  },

  async update(id: string, data: any) {
    const [updated] = await db
      .update(users)
      .set({
        email: data.email,
        passwordHash: data.passwordHash,
        role: data.role
      })
      .where(eq(users.id, id))
      .returning();
    return updated;
  },

  async delete(id: string) {
    const [deleted] = await db
      .delete(users)
      .where(eq(users.id, id))
      .returning();
    return deleted;
  },

  async findById(id: string) {
    const [row] = await db.select().from(users).where(eq(users.id, id));
    return row || null;
  },

  async findMany(filter: Record<string, unknown> = {}) {
    const safeFilter = safeDetails(filter);

    if (safeFilter.email) {
      return await db.select().from(users).where(eq(users.email, safeFilter.email as string));
    }
    return await db.select().from(users);
  }
};

export default usersRepo;
