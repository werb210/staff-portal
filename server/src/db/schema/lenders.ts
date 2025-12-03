import { pgTable, serial, text, timestamp, json } from "drizzle-orm/pg-core";

export const lenders = pgTable("lenders", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email"),
  phone: text("phone"),
  products: json("products"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});
