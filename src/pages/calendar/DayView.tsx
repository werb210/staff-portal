import type { CalendarEvent, O365Event } from "@/api/calendar";
import { groupEventsByDay, sortEvents } from "./utils";

const EventBlock = ({ title, time, subtitle, color }: { title: string; time: string; subtitle?: string; color?: string }) => (
  <div className="calendar-event" style={{ borderLeft: `4px solid ${color || "var(--brand-600, #2563eb"}` }}>
    <div className="calendar-event__title">{title}</div>
    <div className="calendar-event__meta">{time}</div>
    {subtitle && <div className="calendar-event__subtitle">{subtitle}</div>}
  </div>
);

const DayView = ({ date, localEvents, o365Events }: { date: Date; localEvents: CalendarEvent[]; o365Events: O365Event[] }) => {
  const dayKey = date.toDateString();
  const local = groupEventsByDay(localEvents)[dayKey] ?? [];
  const external = groupEventsByDay(o365Events)[dayKey] ?? [];
  const events = sortEvents([...local, ...external]);

  return (
    <div className="calendar-view calendar-view--day">
      <h4>{date.toLocaleDateString(undefined, { weekday: "long", month: "short", day: "numeric" })}</h4>
      {!events.length && <p className="muted">No events scheduled.</p>}
      {events.map((event) => (
        <EventBlock
          key={event.id}
          title={event.title}
          time={`${new Date(event.start).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })} - ${new Date(event.end).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`}
          subtitle={(event as O365Event).attendees?.join(", ") || (event as CalendarEvent).description}
          color={(event as O365Event).categoryColor}
        />
      ))}
    </div>
  );
};

export default DayView;
