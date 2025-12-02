import { Component, inject } from "@angular/core";
import { ChangeDetectionStrategy } from "@angular/core";
import { CustomizerSettingsService } from "../../../../core/customizer-settings/customizer-settings.service";

@Component({
  selector: "app-footer",
  imports: [],
  templateUrl: "./footer.component.html",
  styleUrl: "./footer.component.scss",
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FooterComponent {
  readonly themeService = inject(CustomizerSettingsService);
}

