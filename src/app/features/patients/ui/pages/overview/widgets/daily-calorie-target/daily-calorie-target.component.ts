import { Component, computed, inject } from "@angular/core";
import { ChangeDetectionStrategy } from "@angular/core";
import { MatCardModule } from "@angular/material/card";
import { CustomizerSettingsService } from "../../../../../../../core/customizer-settings/customizer-settings.service";
import { PatientDetailStore } from "../../../../../data-access/stores/patient-detail.store";
import { CalorieTargetsStore } from "../../../../../data-access/stores/calorie-targets.store";

interface DailyCalorieCardData {
  targetLabel: string;
  consumedLabel: string;
  differenceLabel: string;
  statusLabel: string;
  badgeClass: "up" | "down" | "neutral";
  badgeIcon: "trending_up" | "trending_down" | "trending_flat";
}

@Component({
  selector: "app-daily-calorie-target",
  imports: [MatCardModule],
  templateUrl: "./daily-calorie-target.component.html",
  styleUrl: "./daily-calorie-target.component.scss",
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DailyCalorieTargetComponent {
  private readonly patientDetailStore = inject(PatientDetailStore);
  private readonly calorieTargetsStore = inject(CalorieTargetsStore);
  readonly themeService = inject(CustomizerSettingsService);

  protected readonly calorieCard = computed<DailyCalorieCardData>(() => {
    const targets = this.calorieTargetsStore.targets();
    const dailySummary = this.patientDetailStore.dailySummary();
    const placeholder = "—";

    const targetCalories = targets?.calories ?? null;
    const consumedCalories = dailySummary?.consumed?.calories ?? null;
    const differenceCalories =
      targetCalories !== null && consumedCalories !== null
        ? consumedCalories - targetCalories
        : null;

    const targetLabel =
      targetCalories !== null
        ? `${this.formatWholeNumber(targetCalories)} kcal`
        : `${placeholder} kcal`;

    const consumedLabel = `Consumidas hoy: ${
      consumedCalories !== null
        ? `${this.formatWholeNumber(consumedCalories)} kcal`
        : `${placeholder} kcal`
    }`;

    const differenceLabel =
      differenceCalories !== null
        ? `${differenceCalories > 0 ? "+" : ""}${this.formatWholeNumber(
            differenceCalories,
          )} kcal`
        : `${placeholder} kcal`;

    const status = dailySummary?.status ?? null;
    const { badgeClass, badgeIcon, statusLabel } = this.mapStatusMetadata(
      status,
      differenceCalories,
    );

    return {
      targetLabel,
      consumedLabel,
      differenceLabel,
      statusLabel,
      badgeClass,
      badgeIcon,
    };
  });

  private formatWholeNumber(value: number): string {
    return value.toLocaleString("es-ES", {
      maximumFractionDigits: 0,
      minimumFractionDigits: 0,
    });
  }

  private mapStatusMetadata(
    status: string | null,
    difference: number | null,
  ): {
    badgeClass: "up" | "down" | "neutral";
    badgeIcon: "trending_up" | "trending_down" | "trending_flat";
    statusLabel: string;
  } {
    switch (status) {
      case "under_target":
        return {
          badgeClass: "down",
          badgeIcon: "trending_down",
          statusLabel: "Bajo objetivo",
        };
      case "over_target":
        return {
          badgeClass: "up",
          badgeIcon: "trending_up",
          statusLabel: "Sobre objetivo",
        };
      case "on_target":
        return {
          badgeClass: "neutral",
          badgeIcon: "trending_flat",
          statusLabel: "En objetivo",
        };
      default: {
        if (difference !== null && difference !== 0) {
          return difference > 0
            ? {
                badgeClass: "up",
                badgeIcon: "trending_up",
                statusLabel: "Sobre objetivo",
              }
            : {
                badgeClass: "down",
                badgeIcon: "trending_down",
                statusLabel: "Bajo objetivo",
              };
        }
        return {
          badgeClass: "neutral",
          badgeIcon: "trending_flat",
          statusLabel: "Sin datos",
        };
      }
    }
  }
}
