import {
  Component,
  OnInit,
  PLATFORM_ID,
  DestroyRef,
  ViewChild,
  AfterViewInit,
  effect,
  inject,
} from "@angular/core";
import { WorkingScheduleComponent } from "../component/working-schedule/working-schedule.component";
import { MatButtonModule } from "@angular/material/button";
import { MatMenuModule } from "@angular/material/menu";
import { MatCardModule } from "@angular/material/card";
import { CalendarOptions } from "@fullcalendar/core";
import dayGridPlugin from "@fullcalendar/daygrid";
import {
  FullCalendarComponent,
  FullCalendarModule,
} from "@fullcalendar/angular";
import { CustomizerSettingsService } from "../../../../core/customizer-settings/customizer-settings.service";
import { isPlatformBrowser } from "@angular/common";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { MatSnackBar } from "@angular/material/snack-bar";
import { UserStore } from "../../../../core/user/user.store";
import { LoggerService } from "../../../../core/logger/logger.service";
import { CalendarEventsService } from "../../data-access/services/calendar-events.service";
import { CalendarEvent } from "../../domain/models";

@Component({
  selector: "app-calendar",
  imports: [
    WorkingScheduleComponent,
    MatButtonModule,
    MatMenuModule,
    MatCardModule,
    FullCalendarModule,
  ],
  templateUrl: "./calendar.component.html",
  styleUrl: "./calendar.component.scss",
})
export class CalendarComponent implements OnInit, AfterViewInit {
  protected platformId = inject(PLATFORM_ID);
  private readonly destroyRef = inject(DestroyRef);
  private readonly snackBar = inject(MatSnackBar);
  private readonly userStore = inject(UserStore);
  private readonly logger = inject(LoggerService);
  private readonly calendarEventsService = inject(CalendarEventsService);
  readonly themeService = inject(CustomizerSettingsService);
  readonly isBrowser = isPlatformBrowser(this.platformId);
  readonly events = this.calendarEventsService.events;
  @ViewChild("mainCalendar") private calendarComponent?:
    | FullCalendarComponent
    | undefined;

  // Calendar
  calendarOptions: CalendarOptions = {
    initialView: "dayGridMonth",
    dayMaxEvents: true, // when too many events in a day, show the popover
    weekends: true,
    events: [],
    plugins: [dayGridPlugin],
  };

  private readonly syncCalendarEventsEffect = effect(() => {
    const events = this.events();
    this.applyEventsToCalendar(events);
  });

  ngOnInit(): void {
    if (!this.isBrowser) {
      return;
    }

    const userId = this.userStore.userId();
    if (!userId) {
      this.snackBar.open(
        "We couldn't find your user information. Please try again.",
        "Close",
        { duration: 5000 },
      );
      return;
    }

    this.calendarEventsService
      .loadEvents(userId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        error: (error) => {
          this.logger.error(
            "[CalendarComponent] Error loading calendar events",
            error,
          );
          this.snackBar.open(
            "We couldn't load your calendar events. Please try again.",
            "Close",
            { duration: 5000 },
          );
        },
      });
  }

  ngAfterViewInit(): void {
    if (!this.isBrowser) {
      return;
    }
    queueMicrotask(() => this.applyEventsToCalendar(this.events()));
  }

  private applyEventsToCalendar(events: CalendarEvent[]): void {
    if (this.isBrowser && this.calendarComponent) {
      const api = this.calendarComponent.getApi();
      api.removeAllEvents();
      events.forEach((event) => {
        api.addEvent({
          id: event.id,
          title: event.event_name,
          start: event.event_date,
          classNames: [this.calendarEventsService.getEventColorClass(event.id)],
        });
      });
      return;
    }

    this.calendarOptions = {
      ...this.calendarOptions,
      events: events.map((event) => ({
        id: event.id,
        title: event.event_name,
        date: event.event_date,
        classNames: [this.calendarEventsService.getEventColorClass(event.id)],
      })),
    };
  }
}
