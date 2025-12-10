import { apiClient } from "./client";

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

export const fetchLocalEvents = () => apiClient.get<CalendarEvent[]>("/api/calendar/events");

export const createLocalEvent = (event: Partial<CalendarEvent>) =>
  apiClient.post<CalendarEvent>("/api/calendar/events", event);

export const updateLocalEvent = (id: string, event: Partial<CalendarEvent>) =>
  apiClient.patch<CalendarEvent>(`/api/calendar/events/${id}`, event);

export const deleteLocalEvent = (id: string) => apiClient.delete<void>(`/api/calendar/events/${id}`);

export const fetchO365Events = (view: "week" | "month") =>
  apiClient.get<O365Event[]>(`/api/o365/calendar/events?view=${view}`);
