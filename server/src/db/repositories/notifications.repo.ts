import db from "../db.js";

const notificationsRepo = {
  findUnreadByUser: (userId: string) =>
    db.query(
      "SELECT * FROM notifications WHERE user_id=$1 AND read=false ORDER BY created_at DESC",
      [userId]
    ),
  markRead: (id: string) =>
    db.query("UPDATE notifications SET read=true WHERE id=$1 RETURNING *", [id]),
  create: (data: any) =>
    db.query(
      `INSERT INTO notifications (user_id, message)
       VALUES ($1,$2) RETURNING *`,
      [data.user_id, data.message]
    ),
};

export default notificationsRepo;
