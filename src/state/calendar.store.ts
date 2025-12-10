import { create } from "zustand";

export type CalendarView = "day" | "week" | "month";

type CalendarState = {
  currentDate: Date;
  view: CalendarView;
  meetingLinks: { userId: string; name: string; link: string }[];
  setView: (view: CalendarView) => void;
  goToToday: () => void;
  goPrev: () => void;
  goNext: () => void;
  setMeetingLinks: (links: { userId: string; name: string; link: string }[]) => void;
};

const shiftDate = (date: Date, view: CalendarView, direction: 1 | -1) => {
  const next = new Date(date);
  if (view === "day") next.setDate(date.getDate() + direction);
  if (view === "week") next.setDate(date.getDate() + 7 * direction);
  if (view === "month") next.setMonth(date.getMonth() + direction);
  return next;
};

export const useCalendarStore = create<CalendarState>((set, get) => ({
  currentDate: new Date(),
  view: "week",
  meetingLinks: [],
  setView: (view) => set({ view }),
  goToToday: () => set({ currentDate: new Date() }),
  goPrev: () => set({ currentDate: shiftDate(get().currentDate, get().view, -1) }),
  goNext: () => set({ currentDate: shiftDate(get().currentDate, get().view, 1) }),
  setMeetingLinks: (links) => set({ meetingLinks: links })
}));
