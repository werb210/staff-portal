import { db } from "../db.js";

export default {
  findAll: async () => db.contacts,
  findById: async (id) => db.contacts.find((c) => c.id === id) || null,

  create: async (data) => {
    db.contacts.push(data);
    return data;
  },

  update: async (id, data) => {
    const idx = db.contacts.findIndex((c) => c.id === id);
    if (idx === -1) return null;
    db.contacts[idx] = { ...db.contacts[idx], ...data };
    return db.contacts[idx];
  },

  delete: async (id) => {
    const idx = db.contacts.findIndex((c) => c.id === id);
    if (idx === -1) return null;
    const removed = db.contacts[idx];
    db.contacts.splice(idx, 1);
    return removed;
  },
};
