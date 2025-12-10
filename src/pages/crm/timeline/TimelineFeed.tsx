import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import type { TimelineEvent, TimelineEventType } from "@/api/crm";
import { fetchTimeline } from "@/api/crm";
import TimelineItem from "./TimelineItem";
import TimelineFilters from "./TimelineFilters";

interface TimelineFeedProps {
  entityType: "contact" | "company";
  entityId: string;
  initialEvents?: TimelineEvent[];
}

const TimelineFeed = ({ entityType, entityId, initialEvents = [] }: TimelineFeedProps) => {
  const [activeTypes, setActiveTypes] = useState<TimelineEventType[]>(["call", "sms", "email", "note", "document", "status", "ai", "lender", "system"]);
  const { data: events = initialEvents, refetch } = useQuery({
    queryKey: ["timeline", entityType, entityId],
    queryFn: () => fetchTimeline(entityType, entityId),
    initialData: initialEvents
  });

  useEffect(() => {
    const interval = setInterval(() => {
      refetch();
    }, 30000);
    return () => clearInterval(interval);
  }, [refetch]);

  const grouped = useMemo(() => {
    const filtered = events.filter((event) => activeTypes.includes(event.type));
    return filtered.reduce<Record<string, TimelineEvent[]>>((acc, event) => {
      const dateKey = new Date(event.occurredAt).toDateString();
      acc[dateKey] = acc[dateKey] ? [...acc[dateKey], event] : [event];
      return acc;
    }, {});
  }, [events, activeTypes]);

  const toggleType = (type: TimelineEventType) => {
    setActiveTypes((current) =>
      current.includes(type) ? current.filter((t) => t !== type) : [...current, type]
    );
  };

  return (
    <div data-testid="timeline-feed">
      <TimelineFilters activeTypes={activeTypes} onToggle={toggleType} onReset={() => setActiveTypes(["call", "sms", "email", "note", "document", "status", "ai", "lender", "system"])} />
      {Object.entries(grouped).map(([date, eventsForDate]) => (
        <div key={date} className="mb-4">
          <h4 className="font-semibold">{date}</h4>
          <div className="flex flex-col gap-2">
            {eventsForDate
              .sort((a, b) => new Date(b.occurredAt).getTime() - new Date(a.occurredAt).getTime())
              .map((event) => (
                <TimelineItem key={event.id} event={event} />
              ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default TimelineFeed;
