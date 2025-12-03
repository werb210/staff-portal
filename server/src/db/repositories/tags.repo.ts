import { db } from "../db";
import { tags } from "../schema/tags";
import { applicationTags } from "../schema/applicationTags";
import { eq } from "drizzle-orm";

const tagsRepo = {
  async create(data: any) {
    const [created] = await db.insert(tags).values(data).returning();
    return created;
  },

  async findMany() {
    return db.select().from(tags);
  },

  async findById(id: string) {
    const rows = await db.select().from(tags).where(eq(tags.id, id));
    return rows[0] || null;
  },

  async update(id: string, data: any) {
    const [updated] = await db
      .update(tags)
      .set(data)
      .where(eq(tags.id, id))
      .returning();
    return updated;
  },

  async delete(id: string) {
    const [deleted] = await db.delete(tags).where(eq(tags.id, id)).returning();
    return deleted;
  },

  // application ↔ tags linking
  async attachToApp(tagId: string, applicationId: string) {
    await db.insert(applicationTags).values({ tagId, applicationId });
  },

  async removeFromApp(tagId: string, applicationId: string) {
    await db
      .delete(applicationTags)
      .where(eq(applicationTags.tagId, tagId))
      .where(eq(applicationTags.applicationId, applicationId));
  },

  async getTagsForApp(applicationId: string) {
    return db
      .select()
      .from(applicationTags)
      .innerJoin(tags, eq(applicationTags.tagId, tags.id))
      .where(eq(applicationTags.applicationId, applicationId));
  },
};

export default tagsRepo;
