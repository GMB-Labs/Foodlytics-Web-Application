import { Component, inject } from "@angular/core";
import { ChangeDetectionStrategy } from "@angular/core";
import { MatButtonModule } from "@angular/material/button";
import { CustomizerSettingsService } from "../../../../../core/customizer-settings/customizer-settings.service";

@Component({
  selector: "app-terms-conditions",
  imports: [MatButtonModule],
  templateUrl: "./terms-conditions.component.html",
  styleUrl: "./terms-conditions.component.scss",
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TermsConditionsComponent {
  readonly themeService = inject(CustomizerSettingsService);
}
