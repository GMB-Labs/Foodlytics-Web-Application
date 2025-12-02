import { Component, inject } from "@angular/core";
import { CustomizerSettingsService } from "./customizer-settings.service";
import { NgOptimizedImage } from "@angular/common";
import { MatDividerModule } from "@angular/material/divider";
import { MatIconModule } from "@angular/material/icon";
import { MatButtonModule } from "@angular/material/button";
import { NgScrollbarModule } from "ngx-scrollbar";

@Component({
  selector: "app-customizer-settings",
  imports: [
    MatDividerModule,
    MatIconModule,
    MatButtonModule,
    NgScrollbarModule,
    NgOptimizedImage,
  ],
  templateUrl: "./customizer-settings.component.html",
  styleUrl: "./customizer-settings.component.scss",
})
export class CustomizerSettingsComponent {
  readonly themeService = inject(CustomizerSettingsService);
  readonly isToggled = this.themeService.isToggled;

  // Dark Mode
  toggleTheme() {
    this.themeService.toggleTheme();
  }

  // Sidebar Dark
  toggleSidebarTheme() {
    this.themeService.toggleSidebarTheme();
  }

  // Right Sidebar
  toggleRightSidebarTheme() {
    this.themeService.toggleRightSidebarTheme();
  }

  // Hide Sidebar
  toggleHideSidebarTheme() {
    this.themeService.toggleHideSidebarTheme();
  }

  // Header Dark Mode
  toggleHeaderTheme() {
    this.themeService.toggleHeaderTheme();
  }

  // Card Border
  toggleCardBorderTheme() {
    this.themeService.toggleCardBorderTheme();
  }

  // Card Border Radius
  toggleCardBorderRadiusTheme() {
    this.themeService.toggleCardBorderRadiusTheme();
  }

  // RTL Mode
  toggleRTLEnabledTheme() {
    this.themeService.toggleRTLEnabledTheme();
  }

  // Settings Button Toggle
  toggle() {
    this.themeService.toggle();
  }
}
