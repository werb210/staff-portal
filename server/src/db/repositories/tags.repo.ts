import db from "../db.js";

const tagsRepo = {
  findAll: () => db.query("SELECT * FROM tags ORDER BY id DESC"),
  findById: (id: string) => db.query("SELECT * FROM tags WHERE id=$1", [id]),
  create: (name: string) =>
    db.query(`INSERT INTO tags (name) VALUES ($1) RETURNING *`, [name]),
  update: (id: string, name: string) =>
    db.query(`UPDATE tags SET name=$1 WHERE id=$2 RETURNING *`, [name, id]),
  delete: (id: string) => db.query("DELETE FROM tags WHERE id=$1 RETURNING id", [id]),
};

export default tagsRepo;
