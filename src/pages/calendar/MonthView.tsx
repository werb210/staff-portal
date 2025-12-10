import type { CalendarEvent, O365Event } from "@/api/calendar";
import { getMonthGrid, groupEventsByDay } from "./utils";

const MonthView = ({ date, localEvents, o365Events }: { date: Date; localEvents: CalendarEvent[]; o365Events: O365Event[] }) => {
  const grid = getMonthGrid(date);
  const groupedLocal = groupEventsByDay(localEvents);
  const groupedExternal = groupEventsByDay(o365Events);
  const month = date.getMonth();

  return (
    <div className="calendar-view calendar-view--month">
      <div className="calendar-month-grid">
        {grid.map((day) => {
          const isCurrentMonth = day.getMonth() === month;
          const dayKey = day.toDateString();
          const events = [...(groupedLocal[dayKey] ?? []), ...(groupedExternal[dayKey] ?? [])];
          return (
            <div key={day.toISOString()} className={`calendar-month-grid__cell ${isCurrentMonth ? "" : "muted"}`}>
              <div className="calendar-month-grid__header">{day.getDate()}</div>
              {events.slice(0, 3).map((event) => (
                <div key={event.id} className="calendar-event small">
                  <div className="calendar-event__title">{event.title}</div>
                </div>
              ))}
              {events.length > 3 && <div className="muted">+{events.length - 3} more</div>}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default MonthView;
