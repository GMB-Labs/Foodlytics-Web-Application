import { Injectable, inject } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { environment } from "../../../../../environments/environment";
import { CalendarEvent, CreateCalendarEventPayload } from "../../domain/models";

@Injectable({ providedIn: "root" })
export class CalendarEventsApiService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/api/v1/nutritionists`;

  getEvents(nutritionistId: string): Observable<CalendarEvent[]> {
    const encodedId = encodeURIComponent(nutritionistId);
    return this.http.get<CalendarEvent[]>(
      `${this.apiUrl}/${encodedId}/calendar-events`,
    );
  }

  createEvent(
    nutritionistId: string,
    payload: CreateCalendarEventPayload,
  ): Observable<CalendarEvent> {
    const encodedId = encodeURIComponent(nutritionistId);
    return this.http.post<CalendarEvent>(
      `${this.apiUrl}/${encodedId}/calendar-events`,
      payload,
    );
  }

  deleteEvent(
    nutritionistId: string,
    eventId: string,
  ): Observable<{ success: boolean }> {
    const encodedNutritionistId = encodeURIComponent(nutritionistId);
    const encodedEventId = encodeURIComponent(eventId);
    return this.http.delete<{ success: boolean }>(
      `${this.apiUrl}/${encodedNutritionistId}/calendar-events/${encodedEventId}`,
    );
  }
}
