import { Injectable, computed, signal, inject } from "@angular/core";
import { finalize, map, tap } from "rxjs/operators";
import { Observable } from "rxjs";
import { CalendarEvent, CreateCalendarEventPayload } from "../../domain/models";
import { CalendarEventsApiService } from "../api/calendar-events.api";

@Injectable({ providedIn: "root" })
export class CalendarEventsService {
  private readonly api = inject(CalendarEventsApiService);
  private readonly colorPalette = [
    "var(--daxaColor)",
    "var(--infoColor)",
    "var(--warningColor)",
    "var(--primaryColor)",
  ];
  private readonly colorCache = new Map<string, number>();
  private readonly colorClassPrefix = "calendar-event-color-";

  private readonly eventsSignal = signal<CalendarEvent[]>([]);
  private readonly loadingSignal = signal(false);

  readonly events = computed(() => this.eventsSignal());
  readonly loading = computed(() => this.loadingSignal());

  loadEvents(nutritionistId: string): Observable<CalendarEvent[]> {
    this.loadingSignal.set(true);
    return this.api.getEvents(nutritionistId).pipe(
      tap((events) =>
        this.eventsSignal.set(this.sortEvents(this.decorateWithColors(events))),
      ),
      finalize(() => this.loadingSignal.set(false)),
    );
  }

  createEvent(
    nutritionistId: string,
    payload: CreateCalendarEventPayload,
  ): Observable<CalendarEvent> {
    return this.api.createEvent(nutritionistId, payload).pipe(
      tap((created) => {
        const decorated = this.decorateEventWithColor(created);
        this.eventsSignal.update((current) =>
          this.sortEvents([...current, decorated]),
        );
      }),
    );
  }

  deleteEvent(nutritionistId: string, eventId: string): Observable<void> {
    return this.api.deleteEvent(nutritionistId, eventId).pipe(
      tap(() => {
        this.eventsSignal.update((current) =>
          current.filter((event) => event.id !== eventId),
        );
      }),
      map(() => void 0),
    );
  }

  private sortEvents(events: CalendarEvent[]): CalendarEvent[] {
    return [...events].sort((a, b) => {
      const dateComparison =
        this.combineDateTime(a).getTime() - this.combineDateTime(b).getTime();
      if (dateComparison !== 0) {
        return dateComparison;
      }
      return a.event_name.localeCompare(b.event_name);
    });
  }

  private decorateWithColors(events: CalendarEvent[]): CalendarEvent[] {
    return events.map((event) => this.decorateEventWithColor(event));
  }

  private decorateEventWithColor(event: CalendarEvent): CalendarEvent {
    const colorClass = this.getEventColorClass(event.id);
    const colorValue = this.getEventColorValue(event.id);
    return { ...event, color_class: colorClass, color_value: colorValue };
  }

  private combineDateTime(event: CalendarEvent): Date {
    const isoString = `${event.event_date}T${event.event_time}`;
    const date = new Date(isoString);
    return Number.isNaN(date.getTime()) ? new Date(event.event_date) : date;
  }

  getEventColorClass(eventId: string): string {
    return `${this.colorClassPrefix}${this.getColorIndex(eventId)}`;
  }

  getEventColorValue(eventId: string): string {
    const index = this.getColorIndex(eventId);
    return this.colorPalette[index] ?? this.colorPalette[0];
  }

  private getColorIndex(eventId: string): number {
    const cached = this.colorCache.get(eventId);
    if (cached !== undefined) {
      return cached;
    }
    const hash = this.hashString(eventId);
    const index = Math.abs(hash) % this.colorPalette.length;
    this.colorCache.set(eventId, index);
    return index;
  }

  private hashString(value: string): number {
    let hash = 0;
    for (let i = 0; i < value.length; i += 1) {
      hash = (hash << 5) - hash + value.charCodeAt(i);
      hash |= 0;
    }
    return hash;
  }
}
