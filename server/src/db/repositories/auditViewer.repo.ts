import db from "../db";
import { auditLogs } from "../schema/audit";
import { and, eq, gte, lte, ilike, desc } from "drizzle-orm";

interface SearchParams {
  eventType?: string | null;
  userId?: string | null;
  from?: string | null;
  to?: string | null;
  keyword?: string | null;
  page?: number;
  pageSize?: number;
}

export const auditViewerRepo = {
  async search({
    eventType,
    userId,
    from,
    to,
    keyword,
    page = 1,
    pageSize = 25,
  }: SearchParams) {
    const filters: any[] = [];

    if (eventType) filters.push(eq(auditLogs.eventType, eventType));
    if (userId) filters.push(eq(auditLogs.userId, userId));
    if (from) filters.push(gte(auditLogs.createdAt, new Date(from)));
    if (to) filters.push(lte(auditLogs.createdAt, new Date(to)));

    if (keyword) filters.push(ilike(auditLogs.details, `%${keyword}%`));

    const where = filters.length ? and(...filters) : undefined;

    const offset = (page - 1) * pageSize;

    const rows = await db
      .select()
      .from(auditLogs)
      .where(where)
      .orderBy(desc(auditLogs.createdAt))
      .limit(pageSize)
      .offset(offset);

    const [{ count }] = await db
      .select({ count: db.fn.count() })
      .from(auditLogs)
      .where(where);

    return {
      rows,
      total: Number(count),
      page,
      pageSize,
    };
  },
};
