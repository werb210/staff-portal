import { apiClient } from "./client";
import { normalizeArray } from "@/utils/normalize";

export type CalendarEvent = {
  id: string;
  title: string;
  description?: string;
  start: string;
  end: string;
  assignedUserIds?: string[];
  silo?: string;
  relatedApplicationId?: string;
  relatedContactId?: string;
  meetingLink?: string;
  category?: string;
};

export type O365Event = {
  id: string;
  title: string;
  start: string;
  end: string;
  attendees?: string[];
  meetingLink?: string;
  categoryColor?: string;
};

export const fetchLocalEvents = async () => {
  const res = await apiClient.get<CalendarEvent[] | { items: CalendarEvent[] }>("/api/calendar/events");
  return normalizeArray(res.data) as CalendarEvent[];
};

export const createLocalEvent = (event: Partial<CalendarEvent>) =>
  apiClient.post<CalendarEvent>("/api/calendar/events", event);

export const updateLocalEvent = (id: string, event: Partial<CalendarEvent>) =>
  apiClient.patch<CalendarEvent>(`/api/calendar/events/${id}`, event);

export const deleteLocalEvent = (id: string) => apiClient.delete<void>(`/api/calendar/events/${id}`);

export const fetchO365Events = async (view: "week" | "month") => {
  const res = await apiClient.get<O365Event[] | { items: O365Event[] }>(`/api/o365/calendar/events?view=${view}`);
  return normalizeArray(res.data) as O365Event[];
};
