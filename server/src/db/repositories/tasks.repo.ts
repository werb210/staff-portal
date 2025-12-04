import { db } from "../db.js";

export default {
  findAll: async () => db.tasks,

  findById: async (id) =>
    db.tasks.find((t) => t.id === id) || null,

  create: async (data) => {
    db.tasks.push(data);
    return data;
  },

  update: async (id, data) => {
    const idx = db.tasks.findIndex((t) => t.id === id);
    if (idx === -1) return null;

    db.tasks[idx] = { ...db.tasks[idx], ...data };
    return db.tasks[idx];
  },

  delete: async (id) => {
    const idx = db.tasks.findIndex((t) => t.id === id);
    if (idx === -1) return null;

    const removed = db.tasks[idx];
    db.tasks.splice(idx, 1);
    return removed;
  },
};
