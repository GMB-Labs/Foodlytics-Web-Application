import { Injectable, signal, computed } from "@angular/core";
import { DailySummaryDay } from "../api/patient-daily-summaries.api";

@Injectable({ providedIn: "root" })
export class PatientOverviewStatsService {
  readonly dailySummaries = signal<DailySummaryDay[]>([]);
  readonly selectedDayIndex = signal<number | null>(null);
  readonly hoveredDayIndex = signal<number | null>(null);

  setDailySummaries(days: DailySummaryDay[]): void {
    this.dailySummaries.set(days);
    // Auto-select last day if we have days
    if (days.length > 0) {
      this.selectedDayIndex.set(days.length - 1);
    } else {
      this.selectedDayIndex.set(null);
    }
    // Clear hover when data changes
    this.hoveredDayIndex.set(null);
  }

  selectDay(index: number): void {
    const days = this.dailySummaries();
    if (index >= 0 && index < days.length) {
      this.selectedDayIndex.set(index);
    }
  }

  setHoveredDay(index: number | null): void {
    const days = this.dailySummaries();
    if (index === null) {
      this.hoveredDayIndex.set(null);
      return;
    }
    if (index >= 0 && index < days.length) {
      this.hoveredDayIndex.set(index);
    }
  }

  clearHoveredDay(): void {
    this.hoveredDayIndex.set(null);
  }

  /**
   * Returns the summary for the currently active day.
   * Priority: hovered day > selected day > last day (most recent)
   */
  getSelectedSummary(): DailySummaryDay | null {
    const days = this.dailySummaries();
    if (days.length === 0) {
      return null;
    }

    // Priority 1: hovered day
    const hoveredIndex = this.hoveredDayIndex();
    if (hoveredIndex !== null && hoveredIndex >= 0 && hoveredIndex < days.length) {
      return days[hoveredIndex];
    }

    // Priority 2: selected day
    const selectedIndex = this.selectedDayIndex();
    if (selectedIndex !== null && selectedIndex >= 0 && selectedIndex < days.length) {
      return days[selectedIndex];
    }

    // Priority 3: last day (most recent)
    return days[days.length - 1];
  }
}

