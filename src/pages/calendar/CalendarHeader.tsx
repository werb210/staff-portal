import Button from "@/components/ui/Button";
import type { CalendarView } from "@/state/calendar.store";

interface CalendarHeaderProps {
  view: CalendarView;
  onViewChange: (view: CalendarView) => void;
  onPrev: () => void;
  onNext: () => void;
  onToday: () => void;
  onAddTask: () => void;
  onAddEvent: () => void;
  onBookMeeting: () => void;
}

const CalendarHeader = ({
  view,
  onViewChange,
  onPrev,
  onNext,
  onToday,
  onAddTask,
  onAddEvent,
  onBookMeeting
}: CalendarHeaderProps) => (
  <div className="calendar-header">
    <div className="calendar-header__nav">
      <Button onClick={onPrev} variant="outline">
        Prev
      </Button>
      <Button onClick={onToday} variant="outline">
        Today
      </Button>
      <Button onClick={onNext} variant="outline">
        Next
      </Button>
    </div>
    <div className="calendar-header__toggles">
      {(["day", "week", "month"] as CalendarView[]).map((item) => (
        <Button key={item} onClick={() => onViewChange(item)} variant={view === item ? "primary" : "outline"}>
          {item.charAt(0).toUpperCase() + item.slice(1)}
        </Button>
      ))}
    </div>
    <div className="calendar-header__actions">
      <Button onClick={onAddTask}>Add Task</Button>
      <Button onClick={onAddEvent} variant="outline">
        Add Event
      </Button>
      <Button onClick={onBookMeeting} variant="outline">
        Book a Meeting
      </Button>
    </div>
  </div>
);

export default CalendarHeader;
