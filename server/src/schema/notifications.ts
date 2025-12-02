import { pgTable, varchar, timestamp, boolean, uuid } from "drizzle-orm/pg-core";

export const notifications = pgTable("notifications", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: varchar("user_id").notNull(),
  title: varchar("title").notNull(),
  message: varchar("message").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  read: boolean("read").default(false),
});
