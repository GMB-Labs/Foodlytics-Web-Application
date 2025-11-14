import { Location, NgClass, NgOptimizedImage } from "@angular/common";
import { MatMenuModule } from "@angular/material/menu";
import { Component, HostListener, inject } from "@angular/core";
import { ToggleService } from "../sidebar/toggle.service";
import { MatButtonModule } from "@angular/material/button";
import { Router, RouterLink } from "@angular/router";
import { CustomizerSettingsService } from "../../core/customizer-settings/customizer-settings.service";
import { AuthFacade } from "../../core/auth/auth.facade";
import { LoggerService } from "../../core/logger/logger.service";

@Component({
  selector: "app-header",
  imports: [
    NgClass,
    MatMenuModule,
    MatButtonModule,
    RouterLink,
    NgOptimizedImage,
  ],
  templateUrl: "./header.component.html",
  styleUrl: "./header.component.scss",
})
export class HeaderComponent {
  private readonly logger = inject(LoggerService);
  public themeService = inject(CustomizerSettingsService);
  private auth = inject(AuthFacade);
  private router = inject(Router);
  private location = inject(Location);

  logout() {
    this.auth.logout();
  }

  // isSidebarToggled
  isSidebarToggled = false;

  // isToggled
  isToggled = false;

  constructor(private toggleService: ToggleService) {
    this.toggleService.isSidebarToggled$.subscribe((isSidebarToggled) => {
      this.isSidebarToggled = isSidebarToggled;
    });
    this.themeService.isToggled$.subscribe((isToggled) => {
      this.isToggled = isToggled;
    });
  }

  // Burger Menu Toggle
  toggle() {
    this.toggleService.toggle();
  }

  // Navbar Sticky
  isSticky = false;
  @HostListener("window:scroll")
  checkScroll() {
    const scrollPosition =
      window.scrollY ||
      document.documentElement.scrollTop ||
      document.body.scrollTop ||
      0;
    if (scrollPosition >= 50) {
      this.isSticky = true;
    } else {
      this.isSticky = false;
    }
  }

  // Dark Mode
  toggleTheme() {
    this.themeService.toggleTheme();
  }

  goBack() {
    if (window.history.length > 1) {
      this.location.back();
    } else {
      this.router
        .navigate(["/dashboard"])
        .then((r) => this.logger.log("Navigate to dashboard"));
    }
  }
}
