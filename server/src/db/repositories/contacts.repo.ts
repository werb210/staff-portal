// server/src/db/repositories/contacts.repo.ts
// Temporary in-memory contacts repository for staff-portal backend.
// This keeps the app compiling until the Staff-Server API integration is wired in.

import db from "../db.js"; // mock adapter

export interface ContactRecord {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  details?: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

// -----------------------------------------------------------------------------
// In-memory store (runtime only)
// -----------------------------------------------------------------------------
const memoryStore: Map<string, ContactRecord> = new Map();

// -----------------------------------------------------------------------------
// Utilities
// -----------------------------------------------------------------------------
const now = () => new Date();

function makeId() {
  return Math.random().toString(36).substring(2, 12);
}

// -----------------------------------------------------------------------------
// CRUD METHODS
// -----------------------------------------------------------------------------
async function create(data: Partial<ContactRecord>): Promise<ContactRecord> {
  const id = makeId();
  const record: ContactRecord = {
    id,
    name: data.name ?? "Unnamed",
    email: data.email,
    phone: data.phone,
    details: data.details ?? {},
    createdAt: now(),
    updatedAt: now(),
  };

  memoryStore.set(id, record);
  return record;
}

async function findById(id: string): Promise<ContactRecord | null> {
  return memoryStore.get(id) ?? null;
}

async function list(): Promise<ContactRecord[]> {
  return Array.from(memoryStore.values());
}

async function update(
  id: string,
  data: Partial<ContactRecord>
): Promise<ContactRecord | null> {
  const existing = memoryStore.get(id);
  if (!existing) return null;

  const updated: ContactRecord = {
    ...existing,
    ...data,
    updatedAt: now(),
  };

  memoryStore.set(id, updated);
  return updated;
}

async function remove(id: string): Promise<boolean> {
  return memoryStore.delete(id);
}

// -----------------------------------------------------------------------------
// Export shape (final API)
// -----------------------------------------------------------------------------
export default {
  create,
  findById,
  list,
  update,
  remove,
};
