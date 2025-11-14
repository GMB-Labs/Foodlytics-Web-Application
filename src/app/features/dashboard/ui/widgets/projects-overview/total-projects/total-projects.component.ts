import { Component } from "@angular/core";
import { MatCardModule } from "@angular/material/card";
import { CustomizerSettingsService } from "../../../../../../core/customizer-settings/customizer-settings.service";
import { NgOptimizedImage } from "@angular/common";

@Component({
  selector: "app-total-projects",
  imports: [MatCardModule, NgOptimizedImage],
  templateUrl: "./total-projects.component.html",
  styleUrl: "./total-projects.component.scss",
})
export class TotalProjectsComponent {
  constructor(public themeService: CustomizerSettingsService) {}
}
