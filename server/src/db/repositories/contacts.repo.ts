import db from "../db.js";

const contactsRepo = {
  findAll: () => db.query("SELECT * FROM contacts ORDER BY id DESC"),
  findById: (id: string) => db.query("SELECT * FROM contacts WHERE id = $1", [id]),
  create: (data: any) =>
    db.query(
      `INSERT INTO contacts (first_name, last_name, email, phone, company_id)
       VALUES ($1,$2,$3,$4,$5)
       RETURNING *`,
      [data.first_name, data.last_name, data.email, data.phone, data.company_id]
    ),
  update: (id: string, data: any) =>
    db.query(
      `UPDATE contacts SET first_name=$1, last_name=$2, email=$3, phone=$4, company_id=$5
       WHERE id=$6 RETURNING *`,
      [data.first_name, data.last_name, data.email, data.phone, data.company_id, id]
    ),
  delete: (id: string) => db.query("DELETE FROM contacts WHERE id = $1 RETURNING id", [id]),
};

export default contactsRepo;
