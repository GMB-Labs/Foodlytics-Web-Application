import { Component, computed, inject } from "@angular/core";
import { MatCardModule } from "@angular/material/card";
import { CustomizerSettingsService } from "../../../../../../../core/customizer-settings/customizer-settings.service";
import { NgOptimizedImage } from "@angular/common";
import { PatientDetailStore } from "../../../../../data-access/stores/patient-detail.store";

@Component({
  selector: "app-weight-card",
  imports: [MatCardModule, NgOptimizedImage],
  templateUrl: "./weight-card.component.html",
  styleUrl: "./weight-card.component.scss",
})
export class WeightCardComponent {
  private readonly patientDetailStore = inject(PatientDetailStore);
  protected readonly weightDisplay = computed(
    () => this.patientDetailStore.viewModel().weightDisplay,
  );

  constructor(public themeService: CustomizerSettingsService) {}
}
