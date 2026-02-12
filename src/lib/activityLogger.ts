export function logActivity(event: string, metadata: Record<string, unknown> = {}) {
  console.log("Portal Activity:", event, metadata);

  // Ready for future server push
  // fetch("/api/activity", { method: "POST", body: JSON.stringify({ event, metadata }) });
}
