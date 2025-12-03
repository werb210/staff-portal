import { randomUUID } from "crypto";
import { db } from "../db.js";
import { UserEntity } from "../entities/user.entity.js";

class UsersRepo {
  async findByEmail(email: string): Promise<UserEntity | null> {
    const rows = await db.query(
      "SELECT id, email, password_hash as passwordHash, role, created_at as createdAt, updated_at as updatedAt FROM users WHERE email = $1 LIMIT 1",
      [email]
    );
    return rows[0] || null;
  }

  async findById(id: string): Promise<UserEntity | null> {
    const rows = await db.query(
      "SELECT id, email, password_hash as passwordHash, role, created_at as createdAt, updated_at as updatedAt FROM users WHERE id = $1 LIMIT 1",
      [id]
    );
    return rows[0] || null;
  }

  async create(email: string, passwordHash: string, role: string): Promise<UserEntity> {
    const id = randomUUID();
    const now = new Date();

    await db.query(
      `INSERT INTO users (id, email, password_hash, role, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [id, email, passwordHash, role, now, now]
    );

    return {
      id,
      email,
      passwordHash,
      role: role as any,
      createdAt: now,
      updatedAt: now,
    };
  }
}

export const usersRepo = new UsersRepo();

