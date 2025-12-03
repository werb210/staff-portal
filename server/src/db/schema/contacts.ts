import { pgTable, uuid, text, timestamp } from "drizzle-orm/pg-core";

export const contacts = pgTable("contacts", {
  id: uuid("id").defaultRandom().primaryKey(),

  firstName: text("first_name"),
  lastName: text("last_name"),
  email: text("email"),
  phone: text("phone"),

  companyId: uuid("company_id"),

  createdAt: timestamp("created_at").defaultNow(),
});
