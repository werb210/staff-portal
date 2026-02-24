import type { NextFunction, Request, Response } from "express";

function logCrossSiloSecurityEvent(
  req: Request,
  returnedSilo: string
) {
  const securityDb = (globalThis as {
    __STAFF_PORTAL_DB__?: {
      query: (sql: string, params?: unknown[]) => Promise<unknown>;
    };
  }).__STAFF_PORTAL_DB__;

  if (!securityDb) {
    return;
  }

  void securityDb
    .query(
      `
        INSERT INTO security_events (type, metadata)
        VALUES ('CROSS_SILO_ATTEMPT', $1)
      `,
      [
        JSON.stringify({
          userSilo: req.user?.silo,
          returnedSilo,
          route: req.originalUrl
        })
      ]
    )
    .catch((error: unknown) => {
      console.error("Failed to persist cross-silo security event", error);
    });
}

export function validateSiloResponse(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const originalJson = res.json.bind(res);

  res.json = ((body: unknown) => {
    if (Array.isArray(body)) {
      const mismatch = body.find(
        (row: unknown) =>
          typeof row === "object" &&
          row !== null &&
          "silo" in row &&
          typeof (row as { silo?: unknown }).silo === "string" &&
          req.user?.silo &&
          (row as { silo: string }).silo !== req.user.silo
      ) as { silo: string } | undefined;

      if (mismatch) {
        console.error("🚨 CROSS-SILO ANOMALY DETECTED", {
          userSilo: req.user?.silo,
          returnedSilo: mismatch.silo,
          route: req.originalUrl
        });

        logCrossSiloSecurityEvent(req, mismatch.silo);

        return res.status(500).send({ error: "Security violation detected" });
      }
    }

    return originalJson(body);
  }) as Response["json"];

  next();
}
