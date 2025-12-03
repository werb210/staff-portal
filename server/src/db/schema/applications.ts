import { pgTable, serial, text, timestamp, integer, json } from "drizzle-orm/pg-core";

export const applications = pgTable("applications", {
  id: serial("id").primaryKey(),
  businessName: text("business_name").notNull(),
  contactId: integer("contact_id"),
  companyId: integer("company_id"),
  productId: integer("product_id"),
  status: text("status").notNull().default("new"),
  data: json("data"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});
