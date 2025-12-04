import db from "../db.js";

const companiesRepo = {
  findAll: () => db.query("SELECT * FROM companies ORDER BY id DESC"),
  findById: (id: string) => db.query("SELECT * FROM companies WHERE id=$1", [id]),
  create: (data: any) =>
    db.query(
      `INSERT INTO companies (name, website, industry)
       VALUES ($1,$2,$3) RETURNING *`,
      [data.name, data.website, data.industry]
    ),
  update: (id: string, data: any) =>
    db.query(
      `UPDATE companies SET name=$1, website=$2, industry=$3
       WHERE id=$4 RETURNING *`,
      [data.name, data.website, data.industry, id]
    ),
  delete: (id: string) => db.query("DELETE FROM companies WHERE id=$1 RETURNING id", [id]),
};

export default companiesRepo;
