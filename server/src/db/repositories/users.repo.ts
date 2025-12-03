// server/src/db/repositories/users.repo.ts
import db from "../db.js";
import { users } from "../schema/users.js";
import { eq } from "drizzle-orm";

export const usersRepo = {
  async findByEmail(email: string) {
    const rows = await db.select().from(users).where(eq(users.email, email));
    return rows[0] ?? null;
  },

  async findById(id: string) {
    const rows = await db.select().from(users).where(eq(users.id, id));
    return rows[0] ?? null;
  },

  async create(data: any) {
    const rows = await db.insert(users).values(data).returning();
    return rows[0];
  },

  async update(id: string, data: any) {
    const rows = await db.update(users).set(data).where(eq(users.id, id)).returning();
    return rows[0] ?? null;
  },

  async delete(id: string) {
    const rows = await db.delete(users).where(eq(users.id, id)).returning();
    return rows[0] ?? null;
  },

  async findMany(filter: any = {}) {
    let query: any = db.select().from(users);

    if (filter.email) {
      query = query.where(eq(users.email, filter.email));
    }

    const rows = await query;
    return rows;
  }
};

export default usersRepo;
