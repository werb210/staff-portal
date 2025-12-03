export function formatTimestamp(ts: number): string {
  const d = new Date(ts);
  return d.toLocaleString(undefined, {
    hour: "numeric",
    minute: "numeric",
    month: "short",
    day: "numeric",
  });
}
