import { pgTable, uuid, text, timestamp, integer } from "drizzle-orm/pg-core";

export const products = pgTable("products", {
  id: uuid("id").defaultRandom().primaryKey(),

  lenderId: uuid("lender_id"),
  name: text("name"),
  type: text("type"),

  minAmount: integer("min_amount"),
  maxAmount: integer("max_amount"),

  createdAt: timestamp("created_at").defaultNow(),
});
