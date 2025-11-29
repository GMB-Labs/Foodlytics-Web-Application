import { Component, computed, inject } from "@angular/core";
import { MatCardModule } from "@angular/material/card";
import { CustomizerSettingsService } from "../../../../../../../core/customizer-settings/customizer-settings.service";
import { NgOptimizedImage } from "@angular/common";
import { PatientDetailStore } from "../../../../../data-access/stores/patient-detail.store";

@Component({
  selector: "app-height-card",
  imports: [MatCardModule, NgOptimizedImage],
  templateUrl: "./height-card.component.html",
  styleUrl: "./height-card.component.scss",
})
export class HeightCardComponent {
  private readonly patientDetailStore = inject(PatientDetailStore);
  protected readonly heightDisplay = computed(
    () => this.patientDetailStore.viewModel().heightDisplay,
  );

  constructor(public themeService: CustomizerSettingsService) {}
}
