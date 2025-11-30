import { registry } from "../db/registry";
import { transmitToLender } from "../services/lenderPacket";

/**
 * RETRY SCHEDULE:
 *   attempt 1 → after 1 minute
 *   attempt 2 → after 5 minutes
 *   attempt 3 → after 15 minutes
 *   attempt 4 → after 60 minutes
 *   attempt 5 → PERMANENT FAILURE
 */
const BACKOFF_MINUTES = [1, 5, 15, 60];

export async function retryJobTick() {
  const now = new Date();

  const due = await registry.retryQueue.findMany({
    where: {
      nextAttemptAt: { lte: now },
      status: "pending",
    },
  });

  if (due.length === 0) return;

  for (const job of due) {
    console.log("🔁 Retrying transmission job:", job.id);

    const result = await transmitToLender({
      applicationId: job.applicationId,
      lenderId: job.lenderId,
      endpoint: job.endpoint,
    });

    // Log the attempt
    await registry.transmissionLog.create({
      data: {
        applicationId: job.applicationId,
        lenderId: job.lenderId,
        status: result.ok ? "success" : "failed",
        response: result.response || result.error || "",
        packet: result.packet,
        retryId: job.id,
      },
    });

    if (result.ok) {
      await registry.retryQueue.update({
        where: { id: job.id },
        data: { status: "delivered" },
      });
      continue;
    }

    // Failure: schedule next attempt
    const nextAttemptIndex = job.attempt + 1;

    if (nextAttemptIndex >= BACKOFF_MINUTES.length) {
      await registry.retryQueue.update({
        where: { id: job.id },
        data: {
          status: "failed_permanent",
          attempt: nextAttemptIndex,
          lastError: result.error || "Unknown error",
        },
      });
      continue;
    }

    const nextAttemptAt = new Date(
      Date.now() + BACKOFF_MINUTES[nextAttemptIndex] * 60_000
    );

    await registry.retryQueue.update({
      where: { id: job.id },
      data: {
        attempt: nextAttemptIndex,
        nextAttemptAt,
        lastError: result.error || "Unknown error",
      },
    });
  }
}

/**
 * Runs every 60 seconds
 */
export function startRetryQueue() {
  console.log("⏳ Starting retry queue...");
  setInterval(() => {
    retryJobTick().catch((err) =>
      console.error("❌ Retry job error:", err)
    );
  }, 60_000);
}
