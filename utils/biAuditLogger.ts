import { siloQuery } from "../db/siloQuery";

export async function logBIAudit(
  userId: string,
  silo: "BF" | "BI" | "SLF",
  action: string,
  entityId?: string,
  metadata?: Record<string, any>
) {
  await siloQuery(
    silo,
    `
    INSERT INTO bi_audit_log (user_id, silo, action, entity_id, metadata)
    SELECT $1, $2, $3, $4, $5
    FROM (SELECT $2::text AS silo) AS scoped
    WHERE silo = $2
    `,
    [userId, silo, action, entityId || null, metadata || {}]
  );
}
