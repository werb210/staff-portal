import db from "../db.js";

const dealsRepo = {
  findAll: () => db.query("SELECT * FROM deals ORDER BY id DESC"),
  findById: (id: string) => db.query("SELECT * FROM deals WHERE id=$1", [id]),
  create: (data: any) =>
    db.query(
      `INSERT INTO deals (contact_id, company_id, stage, value)
       VALUES ($1,$2,$3,$4) RETURNING *`,
      [data.contact_id, data.company_id, data.stage, data.value]
    ),
  update: (id: string, data: any) =>
    db.query(
      `UPDATE deals SET contact_id=$1, company_id=$2, stage=$3, value=$4
       WHERE id=$5 RETURNING *`,
      [data.contact_id, data.company_id, data.stage, data.value, id]
    ),
  delete: (id: string) => db.query("DELETE FROM deals WHERE id=$1 RETURNING id", [id]),
};

export default dealsRepo;
