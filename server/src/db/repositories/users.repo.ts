import { randomUUID } from "crypto";
import { eq } from "drizzle-orm";
import { db } from "../db.js";
import { users } from "../schema/users.js";

export interface UserRecord {
  id: string;
  email: string;
  name: string | null;
  passwordHash: string;
  role: string;
  active: boolean | null;
  createdAt: Date | null;
  updatedAt: Date | null;
}

class UsersRepo {
  async getAll(): Promise<UserRecord[]> {
    return db.select().from(users).orderBy(users.createdAt);
  }

  async findMany(): Promise<UserRecord[]> {
    return this.getAll();
  }

  async getById(id: string): Promise<UserRecord | null> {
    const [row] = await db.select().from(users).where(eq(users.id, id));
    return row ?? null;
  }

  async findById(id: string): Promise<UserRecord | null> {
    return this.getById(id);
  }

  async getByEmail(email: string): Promise<UserRecord | null> {
    const [row] = await db.select().from(users).where(eq(users.email, email));
    return row ?? null;
  }

  async findByEmail(email: string): Promise<UserRecord | null> {
    return this.getByEmail(email);
  }

  async create(data: { email: string; name?: string; passwordHash: string; role: string }) {
    const now = new Date();
    const [row] = await db
      .insert(users)
      .values({
        id: randomUUID(),
        email: data.email,
        name: data.name ?? null,
        passwordHash: data.passwordHash,
        role: data.role,
        createdAt: now,
        updatedAt: now
      })
      .returning();

    return row ?? null;
  }

  async update(id: string, data: Partial<Omit<UserRecord, "id" | "createdAt" | "updatedAt">>) {
    const updates = Object.fromEntries(
      Object.entries({
        email: data.email,
        name: data.name,
        passwordHash: data.passwordHash,
        role: data.role,
        active: data.active,
        updatedAt: new Date()
      }).filter(([, value]) => value !== undefined)
    );

    if (Object.keys(updates).length === 0) {
      return this.getById(id);
    }

    const [row] = await db.update(users).set(updates).where(eq(users.id, id)).returning();
    return row ?? null;
  }

  async delete(id: string) {
    const [row] = await db.delete(users).where(eq(users.id, id)).returning();
    return row ?? null;
  }
}

export const usersRepo = new UsersRepo();

export default usersRepo;
