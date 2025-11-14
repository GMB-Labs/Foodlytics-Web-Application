import { Component } from "@angular/core";
import { MatCardModule } from "@angular/material/card";
import { CustomizerSettingsService } from "../../../../../core/customizer-settings/customizer-settings.service";
import { NgOptimizedImage } from "@angular/common";

@Component({
  selector: "app-total-orders",
  imports: [MatCardModule, NgOptimizedImage],
  templateUrl: "./total-orders.component.html",
  styleUrl: "./total-orders.component.scss",
})
export class TotalOrdersComponent {
  constructor(public themeService: CustomizerSettingsService) {}
}
