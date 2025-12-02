import { Component, computed, effect, inject } from "@angular/core";
import { ChangeDetectionStrategy } from "@angular/core";
import { MatButtonModule } from "@angular/material/button";
import { MatCardModule } from "@angular/material/card";
import { MatMenuModule } from "@angular/material/menu";
import { MacroTargetsService } from "./macro-targets.service";
import { CustomizerSettingsService } from "../../../../../../../core/customizer-settings/customizer-settings.service";
import { ApxChartDirective } from "../../../../../../../shared/data-access/charts";
import { CalorieTargetsStore } from "../../../../../data-access/stores/calorie-targets.store";

interface MacroDisplay {
  gramsValue: number | null;
  gramsLabel: string;
  percentValue: number | null;
  percentLabel: string;
}

interface MacroOverview {
  macros: {
    protein: MacroDisplay;
    carbs: MacroDisplay;
    fats: MacroDisplay;
  };
  chartSeries: number[];
}

@Component({
  selector: "app-macro-targets",
  imports: [MatCardModule, MatMenuModule, MatButtonModule, ApxChartDirective],
  templateUrl: "./macro-targets.component.html",
  styleUrl: "./macro-targets.component.scss",
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MacroTargetsComponent {
  public themeService = inject(CustomizerSettingsService);
  protected mostLeadsService = inject(MacroTargetsService);
  private readonly calorieTargetsStore = inject(CalorieTargetsStore);

  protected readonly macroOverview = computed<MacroOverview>(() => {
    const targets = this.calorieTargetsStore.targets();
    const placeholder = "—";

    const protein = this.buildMacroDisplay(targets?.protein_grams ?? null);
    const carbs = this.buildMacroDisplay(targets?.carb_grams ?? null);
    const fats = this.buildMacroDisplay(targets?.fat_grams ?? null);

    const macroList = [protein, carbs, fats];
    const total = macroList.reduce(
      (sum, macro) => sum + (macro.gramsValue ?? 0),
      0,
    );
    const hasAnyValue = total > 0;

    macroList.forEach((macro) => {
      if (macro.gramsValue === null || !hasAnyValue) {
        macro.percentValue = null;
        macro.percentLabel = `${placeholder}%`;
        return;
      }
      const percent = (macro.gramsValue / total) * 100;
      macro.percentValue = percent;
      macro.percentLabel = `${Math.round(percent)}%`;
    });

    const chartSeries = hasAnyValue
      ? macroList.map((macro) => macro.gramsValue ?? 0)
      : [];

    return {
      macros: {
        protein,
        carbs,
        fats,
      },
      chartSeries,
    };
  });

  private readonly updateSeriesEffect = effect(
    () => {
      const overview = this.macroOverview();
      this.mostLeadsService.setSeries(overview.chartSeries);
    },
    { allowSignalWrites: true },
  );

  private buildMacroDisplay(value: number | null): MacroDisplay {
    const placeholder = "—";
    return {
      gramsValue: value,
      gramsLabel:
        value !== null ? `${this.formatWholeNumber(value)} g` : placeholder,
      percentValue: null,
      percentLabel: `${placeholder}%`,
    };
  }

  private formatWholeNumber(value: number): string {
    return value.toLocaleString("es-ES", {
      maximumFractionDigits: 0,
      minimumFractionDigits: 0,
    });
  }
}
