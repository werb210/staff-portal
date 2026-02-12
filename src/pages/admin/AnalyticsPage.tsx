import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";

type AnalyticsEvent = {
  event_name?: string;
};

export default function AnalyticsPage() {
  const { user } = useAuth();
  const [events, setEvents] = useState<AnalyticsEvent[]>([]);

  useEffect(() => {
    fetch("/api/analytics")
      .then((res) => res.json())
      .then((data) => setEvents(Array.isArray(data) ? data : []))
      .catch(() => setEvents([]));
  }, []);

  if (user?.role !== "Admin") {
    return <div>Access denied</div>;
  }

  return (
    <div className="page space-y-4">
      <h1 className="text-xl font-semibold">Website Analytics Events</h1>
      <ul className="list-disc space-y-1 pl-5">
        {events.map((event, i) => (
          <li key={`${event.event_name ?? "event"}-${i}`}>{event.event_name}</li>
        ))}
      </ul>
    </div>
  );
}

