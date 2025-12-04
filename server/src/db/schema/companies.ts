import { pgTable, varchar, text, timestamp, jsonb } from "drizzle-orm/pg-core";

export const companies = pgTable("companies", {
  id: varchar("id").primaryKey(),
  name: varchar("name").notNull(),
  details: jsonb("details"),
  createdAt: timestamp("created_at").defaultNow(),
});
