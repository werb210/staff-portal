import type { TimelineEvent } from "@/api/crm";

const iconForType: Record<TimelineEvent["type"], string> = {
  call: "📞",
  sms: "💬",
  email: "✉️",
  note: "📝",
  document: "📄",
  status: "🔄",
  ai: "🤖",
  lender: "🏦",
  system: "⚙️"
};

interface TimelineItemProps {
  event: TimelineEvent;
}

const TimelineItem = ({ event }: TimelineItemProps) => {
  const icon = iconForType[event.type];
  const date = new Date(event.occurredAt).toLocaleTimeString();
  return (
    <div className="timeline-item" data-testid={`timeline-${event.id}`}>
      <div className="timeline-item__icon">{icon}</div>
      <div>
        <div className="font-bold">{event.summary}</div>
        <div className="text-sm text-gray-600">{date}</div>
        {event.details && <div className="text-sm">{event.details}</div>}
      </div>
    </div>
  );
};

export default TimelineItem;
