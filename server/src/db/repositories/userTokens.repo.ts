import db from "../db.js";

const userTokensRepo = {
  create: (userId: string, token: string) =>
    db.query(
      `INSERT INTO user_tokens (user_id, token)
       VALUES ($1,$2) RETURNING *`,
      [userId, token]
    ),

  find: (token: string) =>
    db.query("SELECT * FROM user_tokens WHERE token=$1 LIMIT 1", [token]),
};

export default userTokensRepo;
