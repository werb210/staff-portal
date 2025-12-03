// server/src/db/db.ts
// Clean stub DB adapter for staff-portal backend.
// This backend does NOT talk to a real database.
// All real persistence happens in Staff-Server.

export type FakeDB = {
  info: string;
};

const db: FakeDB = {
  info: "staff-portal mock database (no persistence)",
};

// Default export ONLY — real code should not import { db }
export default db;
