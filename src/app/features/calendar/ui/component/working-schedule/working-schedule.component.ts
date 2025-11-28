import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  OnInit,
  PLATFORM_ID,
  computed,
  inject,
  input,
  signal,
} from "@angular/core";
import { MatButtonModule } from "@angular/material/button";
import { MatCardModule } from "@angular/material/card";
import {
  MatCalendarCellClassFunction,
  MatDatepickerModule,
} from "@angular/material/datepicker";
import { MatNativeDateModule } from "@angular/material/core";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatInputModule } from "@angular/material/input";
import { MatTooltipModule } from "@angular/material/tooltip";
import { ReactiveFormsModule, FormBuilder, Validators } from "@angular/forms";
import { CustomizerSettingsService } from "../../../../../core/customizer-settings/customizer-settings.service";
import { isPlatformBrowser } from "@angular/common";
import { MatSnackBar } from "@angular/material/snack-bar";
import { LoggerService } from "../../../../../core/logger/logger.service";
import { CalendarService } from "../../../data-access/services/calendar.service";
import { CalendarEvent } from "../../../domain/models";
import { take } from "rxjs/operators";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";

@Component({
  selector: "app-working-schedule:not(p)",
  imports: [
    MatCardModule,
    MatButtonModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatFormFieldModule,
    MatInputModule,
    MatTooltipModule,
    ReactiveFormsModule,
  ],
  templateUrl: "./working-schedule.component.html",
  styleUrl: "./working-schedule.component.scss",
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WorkingScheduleComponent implements OnInit {
  private readonly platformId = inject(PLATFORM_ID);
  private readonly destroyRef = inject(DestroyRef);
  private readonly snackBar = inject(MatSnackBar);
  private readonly logger = inject(LoggerService);
  private readonly calendarService = inject(CalendarService);
  private readonly fb = inject(FormBuilder);
  readonly themeService = inject(CustomizerSettingsService);
  readonly isBrowser = isPlatformBrowser(this.platformId);

  readonly mode = input<"full" | "compact">("full");
  readonly isFullMode = computed(() => this.mode() === "full");
  readonly isCompactMode = computed(() => this.mode() === "compact");

  readonly events = this.calendarService.events;
  private readonly selectedDateSignal = signal<Date>(this.getToday());
  readonly selectedDate = computed(() => this.selectedDateSignal());

  readonly eventsForSelectedDate = computed(() => {
    if (!this.isFullMode()) {
      return [];
    }
    const selectedKey = this.formatDate(this.selectedDateSignal());
    const events = this.events();
    return events
      .filter((event) => event.event_date === selectedKey)
      .sort((a, b) => this.compareEvents(a, b));
  });

  private readonly dateWithEvents = computed(() => {
    const events = this.events();
    return new Set(events.map((event) => event.event_date));
  });

  readonly upcomingEvents = computed(() => this.events().slice(0, 3));

  readonly dateClass: MatCalendarCellClassFunction<Date> = (cellDate, view) => {
    if (view !== "month") {
      return "";
    }
    const dateKey = this.formatDate(cellDate);
    return this.dateWithEvents().has(dateKey) ? "has-event" : "";
  };

  classApplied = false;
  creatingEvent = false;
  deletingEventId: string | null = null;

  readonly eventForm = this.fb.nonNullable.group({
    event_name: ["", [Validators.required, Validators.maxLength(120)]],
    event_date: [this.getToday(), Validators.required],
    event_time: ["", Validators.required],
  });

  ngOnInit(): void {
    if (!this.isBrowser) {
      return;
    }

    this.calendarService
      .loadEvents()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        error: (error) => {
          this.logger.error(
            "[WorkingScheduleComponent] Error loading events",
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

  onDateSelected(date: Date | null): void {
    if (!this.isFullMode()) {
      return;
    }
    if (!date) {
      return;
    }
    const normalized = this.normalizeDate(date);
    this.selectedDateSignal.set(normalized);
    if (!this.classApplied) {
      this.eventForm.patchValue(
        { event_date: normalized },
        { emitEvent: false },
      );
    }
  }

  openAddEvent(): void {
    if (!this.isFullMode()) {
      return;
    }
    this.classApplied = true;
    this.resetEventForm(this.selectedDateSignal());
  }

  closeAddEvent(): void {
    if (!this.isFullMode()) {
      return;
    }
    this.classApplied = false;
    this.resetEventForm(this.selectedDateSignal());
  }

  onSubmitEvent(): void {
    if (this.eventForm.invalid || this.creatingEvent) {
      return;
    }

    const { event_name, event_date, event_time } = this.eventForm.getRawValue();
    if (!event_date) {
      return;
    }

    const payload = {
      event_name: event_name.trim(),
      event_date: this.formatDate(event_date),
      event_time: this.toApiTime(event_date, event_time),
    };

    this.creatingEvent = true;
    this.calendarService
      .createEvent(payload)
      .pipe(take(1))
      .subscribe({
        next: () => {
          this.creatingEvent = false;
          this.snackBar.open("Event created successfully.", "Close", {
            duration: 4000,
          });
          const normalizedDate = this.normalizeDate(event_date);
          this.selectedDateSignal.set(normalizedDate);
          this.resetEventForm(normalizedDate);
          this.classApplied = false;
        },
        error: (error) => {
          this.creatingEvent = false;
          this.logger.error(
            "[WorkingScheduleComponent] Error creating event",
            error,
          );
          this.snackBar.open(
            "We couldn't create the event. Please try again.",
            "Close",
            { duration: 5000 },
          );
        },
      });
  }

  onDeleteEvent(event: CalendarEvent): void {
    if (this.deletingEventId === event.id) {
      return;
    }

    this.deletingEventId = event.id;
    this.calendarService
      .deleteEvent(event.id)
      .pipe(take(1))
      .subscribe({
        next: () => {
          this.deletingEventId = null;
          this.snackBar.open("Event deleted successfully.", "Close", {
            duration: 4000,
          });
        },
        error: (error) => {
          this.deletingEventId = null;
          this.logger.error(
            "[WorkingScheduleComponent] Error deleting event",
            error,
          );
          this.snackBar.open(
            "We couldn't delete the event. Please try again.",
            "Close",
            { duration: 5000 },
          );
        },
      });
  }

  getFormattedDate(event: CalendarEvent): string {
    const date = this.combineEventDateTime(event);
    if (!date) {
      return event.event_date;
    }
    return new Intl.DateTimeFormat("en-US", {
      month: "long",
      day: "2-digit",
      timeZone: "America/Lima",
    }).format(date);
  }

  getFormattedTime(event: CalendarEvent): string {
    const date = this.combineEventDateTime(event);
    if (!date) {
      return "";
    }
    const formatted = new Intl.DateTimeFormat("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
      timeZone: "America/Lima",
    }).format(date);
    return `${formatted} h`;
  }

  trackByEventId(_index: number, event: CalendarEvent): string {
    return event.id;
  }

  getEventColorClass(event: CalendarEvent): string {
    return this.calendarService.getEventColorClass(event.id);
  }

  getEventDotClass(event: CalendarEvent): string {
    return `event-dot ${this.getEventColorClass(event)}`;
  }

  private compareEvents(a: CalendarEvent, b: CalendarEvent): number {
    const aTime = this.combineEventDateTime(a).getTime();
    const bTime = this.combineEventDateTime(b).getTime();
    return aTime - bTime;
  }

  private combineEventDateTime(event: CalendarEvent): Date {
    const isoString = `${event.event_date}T${event.event_time}`;
    const date = new Date(isoString);
    return Number.isNaN(date.getTime()) ? new Date(event.event_date) : date;
  }

  private getToday(): Date {
    return this.normalizeDate(new Date());
  }

  private normalizeDate(date: Date): Date {
    return new Date(date.getFullYear(), date.getMonth(), date.getDate());
  }

  private formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const day = date.getDate().toString().padStart(2, "0");
    return `${year}-${month}-${day}`;
  }

  private toApiTime(date: Date, timeValue: string): string {
    if (!timeValue) {
      return "00:00:00.000Z";
    }
    const [hours = "00", minutes = "00"] = timeValue.split(":");
    const { year, month, day } = this.splitDateParts(date);
    const utcTimestamp = Date.UTC(
      year,
      month - 1,
      day,
      Number(hours) + 5,
      Number(minutes),
    );
    const iso = new Date(utcTimestamp).toISOString();
    return iso.slice(11);
  }

  private splitDateParts(date: Date): {
    year: number;
    month: number;
    day: number;
  } {
    const formatted = this.formatDate(date);
    const [yearStr, monthStr, dayStr] = formatted.split("-");
    return {
      year: Number(yearStr),
      month: Number(monthStr),
      day: Number(dayStr),
    };
  }

  private resetEventForm(date: Date): void {
    this.eventForm.reset({
      event_name: "",
      event_date: date,
      event_time: "",
    });
    this.eventForm.markAsPristine();
    this.eventForm.markAsUntouched();
    this.eventForm.updateValueAndValidity({ emitEvent: false });
  }
}
