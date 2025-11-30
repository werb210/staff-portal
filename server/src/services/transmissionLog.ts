import { registry } from "../db/registry";

/**
 * Create a retry entry.
 * Called when first transmission attempt fails.
 */
export async function queueRetry({
  applicationId,
  lenderId,
  endpoint,
  error,
}: {
  applicationId: string;
  lenderId: string;
  endpoint: string;
  error: string;
}) {
  const nextAttemptAt = new Date(Date.now() + 60_000);

  return registry.retryQueue.create({
    data: {
      applicationId,
      lenderId,
      endpoint,
      status: "pending",
      attempt: 0,
      nextAttemptAt,
      lastError: error,
    },
  });
}

/**
 * Fetch transmission logs for one application
 */
export async function getTransmissionHistory(applicationId: string) {
  return registry.transmissionLog.findMany({
    where: { applicationId },
    orderBy: { createdAt: "desc" },
  });
}

/**
 * Fetch retry queue items for dashboard
 */
export async function getRetryQueue() {
  return registry.retryQueue.findMany({
    orderBy: [
      { status: "asc" },
      { nextAttemptAt: "asc" },
    ],
  });
}
