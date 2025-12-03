import { pgTable, serial, text } from "drizzle-orm/pg-core";

export const tags = pgTable("tags", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique()
});
