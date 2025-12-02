import { Component, computed, inject } from "@angular/core";
import { ChangeDetectionStrategy } from "@angular/core";
import { MatCardModule } from "@angular/material/card";
import { CustomizerSettingsService } from "../../../../../../../core/customizer-settings/customizer-settings.service";
import { PatientDetailStore } from "../../../../../data-access/stores/patient-detail.store";

@Component({
  selector: "app-age-card",
  imports: [MatCardModule],
  templateUrl: "./age-card.component.html",
  styleUrl: "./age-card.component.scss",
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AgeCardComponent {
  private readonly patientDetailStore = inject(PatientDetailStore);
  protected readonly ageDisplay = computed(
    () => this.patientDetailStore.viewModel().ageDisplay,
  );

  readonly themeService = inject(CustomizerSettingsService);
}
