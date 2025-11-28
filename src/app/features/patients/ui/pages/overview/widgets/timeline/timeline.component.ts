import { Component, computed, inject } from "@angular/core";
import { MatButtonModule } from "@angular/material/button";
import { MatCardModule } from "@angular/material/card";
import { MatMenuModule } from "@angular/material/menu";
import { CustomizerSettingsService } from "../../../../../../../core/customizer-settings/customizer-settings.service";
import { NgClass, NgForOf, NgIf } from "@angular/common";
import {
  MealTimelineEntry,
  PatientDetailStore,
} from "../../../../../data-access/stores/patient-detail.store";

@Component({
  selector: "app-timeline",
  imports: [
    MatButtonModule,
    MatMenuModule,
    MatCardModule,
    NgIf,
    NgForOf,
    NgClass,
  ],
  templateUrl: "./timeline.component.html",
  styleUrl: "./timeline.component.scss",
})
export class TimelineComponent {
  private readonly patientDetailStore = inject(PatientDetailStore);
  protected readonly timelineEntries = computed(
    () => this.patientDetailStore.mealsTimeline(),
  );
  protected readonly timelineLoading = computed(
    () => this.patientDetailStore.mealsLoading(),
  );

  protected readonly mealTrackById = (
    _: number,
    meal: MealTimelineEntry,
  ): string => meal.id;

  constructor(public themeService: CustomizerSettingsService) {}
}
