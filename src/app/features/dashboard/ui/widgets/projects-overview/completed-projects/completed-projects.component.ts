import { Component } from "@angular/core";
import { MatCardModule } from "@angular/material/card";
import { CustomizerSettingsService } from "../../../../../../core/customizer-settings/customizer-settings.service";
import { NgOptimizedImage } from "@angular/common";

@Component({
  selector: "app-completed-projects",
  imports: [MatCardModule, NgOptimizedImage],
  templateUrl: "./completed-projects.component.html",
  styleUrl: "./completed-projects.component.scss",
})
export class CompletedProjectsComponent {
  constructor(public themeService: CustomizerSettingsService) {}
}
