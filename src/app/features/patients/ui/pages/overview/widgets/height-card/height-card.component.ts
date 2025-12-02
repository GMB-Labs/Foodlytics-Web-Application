import { Component, computed, inject } from "@angular/core";
import { ChangeDetectionStrategy } from "@angular/core";
import { MatCardModule } from "@angular/material/card";
import { CustomizerSettingsService } from "../../../../../../../core/customizer-settings/customizer-settings.service";
import { PatientDetailStore } from "../../../../../data-access/stores/patient-detail.store";

@Component({
  selector: "app-height-card",
  imports: [MatCardModule],
  templateUrl: "./height-card.component.html",
  styleUrl: "./height-card.component.scss",
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HeightCardComponent {
  private readonly patientDetailStore = inject(PatientDetailStore);
  protected readonly heightDisplay = computed(
    () => this.patientDetailStore.viewModel().heightDisplay,
  );

  readonly themeService = inject(CustomizerSettingsService);
}
