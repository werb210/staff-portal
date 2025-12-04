import db from "../db.js";

const timelineRepo = {
  findByContact: (contactId: string) =>
    db.query(
      "SELECT * FROM timeline WHERE contact_id=$1 ORDER BY created_at DESC",
      [contactId]
    ),
  addEntry: (data: any) =>
    db.query(
      `INSERT INTO timeline (contact_id, type, message)
       VALUES ($1,$2,$3)
       RETURNING *`,
      [data.contact_id, data.type, data.message]
    ),
};

export default timelineRepo;
