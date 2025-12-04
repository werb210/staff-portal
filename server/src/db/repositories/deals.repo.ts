import { db } from "../db.js";

export default {
  findAll: async () => db.deals,

  findById: async (id) =>
    db.deals.find((d) => d.id === id) || null,

  create: async (data) => {
    db.deals.push(data);
    return data;
  },

  update: async (id, data) => {
    const idx = db.deals.findIndex((d) => d.id === id);
    if (idx === -1) return null;

    db.deals[idx] = { ...db.deals[idx], ...data };
    return db.deals[idx];
  },

  delete: async (id) => {
    const idx = db.deals.findIndex((d) => d.id === id);
    if (idx === -1) return null;

    const removed = db.deals[idx];
    db.deals.splice(idx, 1);
    return removed;
  },
};
