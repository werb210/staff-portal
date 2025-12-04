import db from "../db.js";

const messagesRepo = {
  findAllByContact: (contactId: string) =>
    db.query("SELECT * FROM messages WHERE contact_id=$1 ORDER BY created_at DESC", [
      contactId,
    ]),
  create: (data: any) =>
    db.query(
      `INSERT INTO messages (contact_id, sender, body)
       VALUES ($1,$2,$3) RETURNING *`,
      [data.contact_id, data.sender, data.body]
    ),
};

export default messagesRepo;
