import { Component } from "@angular/core";
import { MatCardModule } from "@angular/material/card";
import { CustomizerSettingsService } from "../../../../../../../core/customizer-settings/customizer-settings.service";
import { NgOptimizedImage } from "@angular/common";

@Component({
  selector: "app-age-card",
  imports: [MatCardModule, NgOptimizedImage],
  templateUrl: "./age-card.component.html",
  styleUrl: "./age-card.component.scss",
})
export class AgeCardComponent {
  constructor(public themeService: CustomizerSettingsService) {}
}
