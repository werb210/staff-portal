import { pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

export const timeline = pgTable("timeline", {
  id: uuid("id").defaultRandom().primaryKey(),
  contact_id: uuid("contact_id").notNull(),
  event_type: text("event_type").notNull(),
  description: text("description"),
  created_at: timestamp("created_at").defaultNow(),
});
