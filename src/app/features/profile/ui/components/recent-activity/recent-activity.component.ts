import { Component } from "@angular/core";
import { MatButtonModule } from "@angular/material/button";
import { MatCardModule } from "@angular/material/card";
import { MatMenuModule } from "@angular/material/menu";
import { CustomizerSettingsService } from "../../../../../core/customizer-settings/customizer-settings.service";
import { NgOptimizedImage } from "@angular/common";

@Component({
  selector: "app-recent-activity:not(p)",
  imports: [MatCardModule, MatMenuModule, MatButtonModule, NgOptimizedImage],
  templateUrl: "./recent-activity.component.html",
  styleUrl: "./recent-activity.component.scss",
})
export class RecentActivityComponent {
  constructor(public themeService: CustomizerSettingsService) {}
}
