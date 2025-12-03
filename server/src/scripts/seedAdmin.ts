import { usersRepo } from "../db/repositories/users.repo.js";
import { hashPassword } from "../utils/hash.js";

async function seedAdmin() {
  const email = "admin@boreal.local";

  const existing = await usersRepo.findByEmail(email);
  if (existing) {
    console.log("Admin user already exists.");
    process.exit(0);
  }

  const passwordHash = await hashPassword("ChangeMe123!");
  await usersRepo.create(email, passwordHash, "admin");

  console.log("Admin seed complete.");
  process.exit(0);
}

seedAdmin();

