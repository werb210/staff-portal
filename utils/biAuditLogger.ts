import { db } from "../db";

export async function logBIAudit(
  userId: string,
  action: string,
  entityId?: string,
  metadata?: Record<string, any>
) {
  await db.query(
    `
    INSERT INTO bi_audit_log (user_id, silo, action, entity_id, metadata)
    VALUES ($1, 'BI', $2, $3, $4)
    `,
    [userId, action, entityId || null, metadata || {}]
  );
}
