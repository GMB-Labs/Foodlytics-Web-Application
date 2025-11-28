import { Component, computed, effect, inject } from "@angular/core";
import { MatButtonModule } from "@angular/material/button";
import { MatCardModule } from "@angular/material/card";
import { MatMenuModule } from "@angular/material/menu";
import { MacroTargetsService } from "./macro-targets.service";
import { CustomizerSettingsService } from "../../../../../../../core/customizer-settings/customizer-settings.service";
import { ApxChartDirective } from "../../../../../../../shared/data-access/charts";
import { PatientDetailStore } from "../../../../../data-access/stores/patient-detail.store";

@Component({
  selector: "app-macro-targets",
  imports: [MatCardModule, MatMenuModule, MatButtonModule, ApxChartDirective],
  templateUrl: "./macro-targets.component.html",
  styleUrl: "./macro-targets.component.scss",
})
export class MacroTargetsComponent {
  public themeService = inject(CustomizerSettingsService);
  protected mostLeadsService = inject(MacroTargetsService);
  private readonly patientDetailStore = inject(PatientDetailStore);

  protected readonly macroOverview = computed(() =>
    this.patientDetailStore.macroOverview(),
  );

  private readonly updateSeriesEffect = effect(
    () => {
      const overview = this.macroOverview();
      this.mostLeadsService.setSeries(overview.chartSeries);
    },
    { allowSignalWrites: true },
  );
}
