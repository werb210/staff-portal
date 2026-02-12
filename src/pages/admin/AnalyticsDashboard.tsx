import { useEffect, useMemo, useState } from "react";
import { AnalyticsService } from "@/services/analyticsService";

type ReadinessPayload = {
  score?: number;
  lenderNetworkCount?: number;
};

export default function AnalyticsDashboard() {
  const [events, setEvents] = useState<any[]>([]);
  const [readiness, setReadiness] = useState<ReadinessPayload>({});

  useEffect(() => {
    async function load() {
      const [eventsRes, readinessRes] = await Promise.all([
        AnalyticsService.getEvents(),
        AnalyticsService.getReadiness()
      ]);

      setEvents(eventsRes.data || []);
      setReadiness(readinessRes.data || {});
    }

    void load();
  }, []);

  const lenderNetworkCount = useMemo(() => {
    if (typeof readiness.lenderNetworkCount === "number") {
      return readiness.lenderNetworkCount;
    }

    return events.reduce((acc, event) => {
      const count = Number(event?.metadata?.lenderNetworkCount);
      return Number.isFinite(count) ? Math.max(acc, count) : acc;
    }, 0);
  }, [events, readiness.lenderNetworkCount]);

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-bold mb-4">Website Analytics</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="border rounded p-4">
          <p className="text-sm text-gray-500">Readiness Score</p>
          <p className="text-3xl font-semibold">{readiness.score ?? "—"}</p>
        </div>
        <div className="border rounded p-4">
          <p className="text-sm text-gray-500">Lender Network Count</p>
          <p className="text-3xl font-semibold">{lenderNetworkCount}</p>
        </div>
      </div>

      <table className="w-full border">
        <thead>
          <tr className="bg-gray-100">
            <th className="p-2 border">Event</th>
            <th className="p-2 border">Metadata</th>
            <th className="p-2 border">Date</th>
          </tr>
        </thead>
        <tbody>
          {events.map((e) => (
            <tr key={e.id}>
              <td className="p-2 border">{e.event}</td>
              <td className="p-2 border text-xs">{JSON.stringify(e.metadata)}</td>
              <td className="p-2 border">{e.created_at}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
