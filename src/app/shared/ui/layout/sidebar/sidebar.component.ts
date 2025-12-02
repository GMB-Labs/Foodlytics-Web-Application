import { Component, inject } from "@angular/core";
import { NgScrollbarModule } from "ngx-scrollbar";
import { MatExpansionModule } from "@angular/material/expansion";
import { RouterLink, RouterLinkActive, RouterModule } from "@angular/router";
import { ToggleService } from "../../../../core/services/toggle.service";
import { NgOptimizedImage } from "@angular/common";
import { CustomizerSettingsService } from "../../../../core/customizer-settings/customizer-settings.service";
import { AuthFacade } from "../../../../core/auth/auth.facade";

@Component({
  selector: "app-sidebar",
  imports: [
    NgScrollbarModule,
    MatExpansionModule,
    RouterLinkActive,
    RouterModule,
    RouterLink,
    NgOptimizedImage,
  ],
  templateUrl: "./sidebar.component.html",
  styleUrl: "./sidebar.component.scss",
})
export class SidebarComponent {
  public themeService = inject(CustomizerSettingsService);
  private auth = inject(AuthFacade);
  private readonly toggleService = inject(ToggleService);

  readonly isSidebarToggled = this.toggleService.isSidebarToggled;
  readonly isToggled = this.themeService.isToggled;

  logout() {
    this.auth.logout();
  }

  // Burger Menu Toggle
  toggle() {
    this.toggleService.toggle();
  }

  // Mat Expansion
  panelOpenState = false;
}

