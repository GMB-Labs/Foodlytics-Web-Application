export interface CalendarEvent {
  id: string;
  nutritionist_id: string;
  event_name: string;
  event_date: string;
  event_time: string;
  color_class?: string;
  color_value?: string;
}

export interface CreateCalendarEventPayload {
  event_name: string;
  event_date: string;
  event_time: string;
}


