import { Component, computed, inject } from "@angular/core";
import { ChangeDetectionStrategy } from "@angular/core";
import { MatCardModule } from "@angular/material/card";
import { CustomizerSettingsService } from "../../../../../../../core/customizer-settings/customizer-settings.service";
import { NgOptimizedImage } from "@angular/common";
import { PatientDetailStore } from "../../../../../data-access/stores/patient-detail.store";

@Component({
  selector: "app-daily-calorie-target",
  imports: [MatCardModule, NgOptimizedImage],
  templateUrl: "./daily-calorie-target.component.html",
  styleUrl: "./daily-calorie-target.component.scss",
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DailyCalorieTargetComponent {
  private readonly patientDetailStore = inject(PatientDetailStore);
  protected readonly calorieCard = computed(() =>
    this.patientDetailStore.calorieCardOverview(),
  );

  readonly themeService = inject(CustomizerSettingsService);
}
