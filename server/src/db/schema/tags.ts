import { pgTable, varchar, text, timestamp } from "drizzle-orm/pg-core";

export const tags = pgTable("tags", {
  id: varchar("id").primaryKey(),
  name: varchar("name").notNull(),
  color: varchar("color"),
  createdAt: timestamp("created_at").defaultNow(),
});
