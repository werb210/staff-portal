import { db } from "../db.js";

export default {
  findAll: async () => db.users,

  findById: async (id) =>
    db.users.find((u) => u.id === id) || null,

  create: async (data) => {
    db.users.push(data);
    return data;
  },

  update: async (id, data) => {
    const idx = db.users.findIndex((u) => u.id === id);
    if (idx === -1) return null;

    db.users[idx] = { ...db.users[idx], ...data };
    return db.users[idx];
  },

  delete: async (id) => {
    const idx = db.users.findIndex((u) => u.id === id);
    if (idx === -1) return null;

    const removed = db.users[idx];
    db.users.splice(idx, 1);
    return removed;
  },
};
