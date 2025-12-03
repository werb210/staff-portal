import bcrypt from "bcryptjs";
import usersRepo, { UserRecord } from "../db/repositories/users.repo.js";

export type PublicUser = Omit<UserRecord, "passwordHash">;

const toPublicUser = (user: UserRecord | null): PublicUser | null => {
  if (!user) return null;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { passwordHash, ...rest } = user;
  return rest;
};

class UsersService {
  async list(): Promise<PublicUser[]> {
    const users = await usersRepo.getAll();
    return users.map((user) => toPublicUser(user)!) as PublicUser[];
  }

  async get(id: string): Promise<PublicUser | null> {
    return toPublicUser(await usersRepo.getById(id));
  }

  async create(payload: { email: string; name?: string; password: string; role: string }): Promise<PublicUser | null> {
    const passwordHash = await bcrypt.hash(payload.password, 10);
    const created = await usersRepo.create({
      email: payload.email,
      name: payload.name,
      passwordHash,
      role: payload.role
    });

    return toPublicUser(created);
  }

  async update(
    id: string,
    payload: { email?: string; name?: string; password?: string; role?: string; active?: boolean }
  ): Promise<PublicUser | null> {
    const passwordHash = payload.password ? await bcrypt.hash(payload.password, 10) : undefined;

    const updated = await usersRepo.update(id, {
      email: payload.email,
      name: payload.name,
      passwordHash,
      role: payload.role,
      active: payload.active ?? undefined
    });

    return toPublicUser(updated);
  }

  async remove(id: string): Promise<PublicUser | null> {
    const deleted = await usersRepo.delete(id);
    return toPublicUser(deleted);
  }
}

export const usersService = new UsersService();

export default usersService;
