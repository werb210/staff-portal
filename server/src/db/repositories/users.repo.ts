import db from "../db.js";

const usersRepo = {
  findAll: () => db.query("SELECT id, email, role FROM users ORDER BY id DESC"),
  findById: (id: string) => db.query("SELECT * FROM users WHERE id=$1", [id]),
  findByEmail: (email: string) =>
    db.query("SELECT * FROM users WHERE email=$1 LIMIT 1", [email]),
  create: (data: any) =>
    db.query(
      `INSERT INTO users (email, password_hash, role)
       VALUES ($1,$2,$3) RETURNING id, email, role`,
      [data.email, data.password_hash, data.role]
    ),
  update: (id: string, data: any) =>
    db.query(
      `UPDATE users SET email=$1, role=$2 WHERE id=$3
       RETURNING id, email, role`,
      [data.email, data.role, id]
    ),
  delete: (id: string) => db.query("DELETE FROM users WHERE id=$1 RETURNING id", [id]),
};

export default usersRepo;
