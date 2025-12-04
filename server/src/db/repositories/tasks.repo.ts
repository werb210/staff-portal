import db from "../db.js";

const tasksRepo = {
  findAll: () => db.query("SELECT * FROM tasks ORDER BY due_date ASC"),
  findById: (id: string) => db.query("SELECT * FROM tasks WHERE id=$1", [id]),
  create: (data: any) =>
    db.query(
      `INSERT INTO tasks (title, description, due_date, assigned_to, related_contact)
       VALUES ($1,$2,$3,$4,$5) RETURNING *`,
      [
        data.title,
        data.description,
        data.due_date,
        data.assigned_to,
        data.related_contact,
      ]
    ),
  update: (id: string, data: any) =>
    db.query(
      `UPDATE tasks
       SET title=$1, description=$2, due_date=$3, assigned_to=$4, related_contact=$5
       WHERE id=$6 RETURNING *`,
      [
        data.title,
        data.description,
        data.due_date,
        data.assigned_to,
        data.related_contact,
        id,
      ]
    ),
  delete: (id: string) => db.query("DELETE FROM tasks WHERE id=$1 RETURNING id", [id]),
};

export default tasksRepo;
