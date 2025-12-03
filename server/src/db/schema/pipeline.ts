import { pgTable, serial, text, timestamp, integer, json } from "drizzle-orm/pg-core";

export const pipeline = pgTable("pipeline", {
  id: serial("id").primaryKey(),
  applicationId: integer("application_id"),
  stage: text("stage").notNull(),
  assignedTo: integer("assigned_to"),
  metadata: json("metadata"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});
