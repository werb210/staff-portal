import { boolean, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

export const notifications = pgTable("notifications", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").notNull(),
  applicationId: uuid("application_id"),
  contactId: uuid("contact_id"),
  title: text("title").notNull(),
  body: text("body").notNull(),
  type: text("type"),
  relatedEntity: text("related_entity"),
  relatedId: text("related_id"),
  read: boolean("read").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
