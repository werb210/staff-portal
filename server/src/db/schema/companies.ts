import { pgTable, uuid, text, timestamp } from "drizzle-orm/pg-core";

export const companies = pgTable("companies", {
  id: uuid("id").defaultRandom().primaryKey(),

  name: text("name"),
  website: text("website"),
  address: text("address"),

  createdAt: timestamp("created_at").defaultNow(),
});
