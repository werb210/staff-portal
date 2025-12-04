import { db } from "../db.js";

export default {
  findAll: async () => db.tags,

  findById: async (id) => db.tags.find((t) => t.id === id) || null,

  create: async (data) => {
    db.tags.push(data);
    return data;
  },

  update: async (id, data) => {
    const idx = db.tags.findIndex((t) => t.id === id);
    if (idx === -1) return null;

    db.tags[idx] = { ...db.tags[idx], ...data };
    return db.tags[idx];
  },

  delete: async (id) => {
    const idx = db.tags.findIndex((t) => t.id === id);
    if (idx === -1) return null;

    const removed = db.tags[idx];
    db.tags.splice(idx, 1);
    return removed;
  },
};
