import { pgTable, serial, text, integer, timestamp, json } from "drizzle-orm/pg-core";

export const products = pgTable("products", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  category: text("category").notNull(),
  minAmount: integer("min_amount"),
  maxAmount: integer("max_amount"),
  details: json("details"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});
