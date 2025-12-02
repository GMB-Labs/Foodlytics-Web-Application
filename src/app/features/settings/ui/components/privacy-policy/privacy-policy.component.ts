import { Component, inject } from "@angular/core";
import { ChangeDetectionStrategy } from "@angular/core";
import { MatButtonModule } from "@angular/material/button";
import { CustomizerSettingsService } from "../../../../../core/customizer-settings/customizer-settings.service";

@Component({
  selector: "app-privacy-policy",
  imports: [MatButtonModule],
  templateUrl: "./privacy-policy.component.html",
  styleUrl: "./privacy-policy.component.scss",
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PrivacyPolicyComponent {
  readonly themeService = inject(CustomizerSettingsService);
}
