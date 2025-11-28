import { Injectable, computed, inject, signal } from "@angular/core";
import { CalendarEventsApiService } from "../api/calendar-events.api";
import { CalendarEvent, CreateCalendarEventPayload } from "../../domain/models";
import { UserStore } from "../../../../core/user/user.store";
import { Observable, of, throwError } from "rxjs";
import { finalize, map, shareReplay, tap } from "rxjs/operators";

@Injectable({ providedIn: "root" })
export class CalendarService {
  private readonly api = inject(CalendarEventsApiService);
  private readonly userStore = inject(UserStore);

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
  private readonly lastLoadedUserId = signal<string | null>(null);
  private loadInFlight$: Observable<CalendarEvent[]> | null = null;

  readonly events = computed(() => this.eventsSignal());
  readonly loading = computed(() => this.loadingSignal());

  loadEvents(options?: { force?: boolean }): Observable<CalendarEvent[]> {
    const userId = this.userStore.userId();
    if (!userId) {
      return throwError(
        () => new Error("User information is required to load calendar events."),
      );
    }
    const force = options?.force ?? false;

    if (
      !force &&
      this.lastLoadedUserId() === userId &&
      this.eventsSignal().length > 0
    ) {
      return of(this.eventsSignal());
    }

    if (!force && this.loadInFlight$) {
      return this.loadInFlight$;
    }

    this.loadingSignal.set(true);

    const request$ = this.api.getEvents(userId).pipe(
      tap((events) => {
        const decorated = this.decorateWithColors(events);
        this.eventsSignal.set(this.sortEvents(decorated));
        this.lastLoadedUserId.set(userId);
      }),
      finalize(() => {
        this.loadingSignal.set(false);
        if (this.loadInFlight$ === request$) {
          this.loadInFlight$ = null;
        }
      }),
      shareReplay(1),
    );

    this.loadInFlight$ = request$;
    return request$;
  }

  createEvent(payload: CreateCalendarEventPayload): Observable<CalendarEvent> {
    const userId = this.userStore.userId();
    if (!userId) {
      return throwError(
        () => new Error("User information is required to create events."),
      );
    }

    return this.api.createEvent(userId, payload).pipe(
      tap((created) => {
        const decorated = this.decorateEventWithColor(created);
        this.eventsSignal.update((current) =>
          this.sortEvents([...current, decorated]),
        );
      }),
    );
  }

  deleteEvent(eventId: string): Observable<void> {
    const userId = this.userStore.userId();
    if (!userId) {
      return throwError(
        () => new Error("User information is required to delete events."),
      );
    }

    return this.api.deleteEvent(userId, eventId).pipe(
      tap(() => {
        this.eventsSignal.update((current) =>
          current.filter((event) => event.id !== eventId),
        );
      }),
      map(() => void 0),
    );
  }

  getEventColorClass(eventId: string): string {
    return `${this.colorClassPrefix}${this.getColorIndex(eventId)}`;
  }

  getEventColorValue(eventId: string): string {
    const index = this.getColorIndex(eventId);
    return this.colorPalette[index] ?? this.colorPalette[0];
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
