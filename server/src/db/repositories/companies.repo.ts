import { db } from "../db.js";

export default {
  findAll: async () => db.companies,
  findById: async (id) => db.companies.find((c) => c.id === id) || null,

  create: async (data) => {
    db.companies.push(data);
    return data;
  },

  update: async (id, data) => {
    const idx = db.companies.findIndex((c) => c.id === id);
    if (idx === -1) return null;
    db.companies[idx] = { ...db.companies[idx], ...data };
    return db.companies[idx];
  },

  delete: async (id) => {
    const idx = db.companies.findIndex((c) => c.id === id);
    if (idx === -1) return null;
    const removed = db.companies[idx];
    db.companies.splice(idx, 1);
    return removed;
  },
};
