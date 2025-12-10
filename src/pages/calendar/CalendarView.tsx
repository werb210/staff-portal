import type { CalendarEvent, O365Event } from "@/api/calendar";
import type { CalendarView as CalendarViewType } from "@/state/calendar.store";
import DayView from "./DayView";
import MonthView from "./MonthView";
import WeekView from "./WeekView";

export type CalendarViewProps = {
  view: CalendarViewType;
  date: Date;
  localEvents: CalendarEvent[];
  o365Events: O365Event[];
};

const CalendarView = ({ view, date, localEvents, o365Events }: CalendarViewProps) => {
  if (view === "day") return <DayView date={date} localEvents={localEvents} o365Events={o365Events} />;
  if (view === "month") return <MonthView date={date} localEvents={localEvents} o365Events={o365Events} />;
  return <WeekView date={date} localEvents={localEvents} o365Events={o365Events} />;
};

export default CalendarView;
