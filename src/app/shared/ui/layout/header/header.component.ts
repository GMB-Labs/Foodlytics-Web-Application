import { Location, NgOptimizedImage } from "@angular/common";
import { MatMenuModule } from "@angular/material/menu";
import {
  Component,
  Injector,
  computed,
  effect,
  inject,
} from "@angular/core";
import { ToggleService } from "../../../../core/services/toggle.service";
import { MatButtonModule } from "@angular/material/button";
import { Router, RouterLink } from "@angular/router";
import { CustomizerSettingsService } from "../../../../core/customizer-settings/customizer-settings.service";
import { AuthFacade } from "../../../../core/auth/auth.facade";
import { LoggerService } from "../../../../core/logger/logger.service";
import { UserStore } from "../../../../core/user/user.store";
import { UserSyncService } from "../../../../core/user/user-sync.service";
import { take } from "rxjs";

@Component({
  selector: "app-header",
  imports: [
    MatMenuModule,
    MatButtonModule,
    RouterLink,
    NgOptimizedImage,
  ],
  templateUrl: "./header.component.html",
  styleUrl: "./header.component.scss",
  host: {
    "(window:scroll)": "checkScroll()",
  },
})
export class HeaderComponent {
  private readonly logger = inject(LoggerService);
  public themeService = inject(CustomizerSettingsService);
  private auth = inject(AuthFacade);
  private router = inject(Router);
  private location = inject(Location);
  private readonly userStore = inject(UserStore);
  private readonly userSync = inject(UserSyncService);
  private readonly injector = inject(Injector);

  readonly hasIncompleteProfile = computed<boolean>(() => {
    const profile = this.userStore.profile();
    if (!profile || typeof profile !== "object") return false;
    return profile.user_profile_completed === false;
  });

  readonly profileName = computed(() => {
    const profile = this.userStore.profile();
    if (profile && typeof profile === "object") {
      const name = `${profile.first_name ?? ""} ${profile.last_name ?? ""}`
        .trim()
        .replace(/\s+/g, " ");
      if (name) return name;
    }
    return this.auth.displayName();
  });

  readonly profileEmail = computed(() => this.auth.email());

  readonly profileRole = computed(() => {
    const roles = this.auth.roles();
    return roles[0] ?? "User";
  });

  readonly profileAvatar = computed(() => {
    return this.userStore.photoUrl() || this.auth.avatar() || null;
  });

  readonly profileInitials = computed(() => {
    const name = this.profileName() || "User";
    const parts = name
      .trim()
      .split(/\s+/)
      .filter(Boolean);
    const initials = parts
      .slice(0, 2)
      .map((value) => value[0]?.toUpperCase() ?? "")
      .join("");
    return initials || "U";
  });

  logout() {
    this.auth.logout();
  }

  private readonly toggleService = inject(ToggleService);
  readonly isSidebarToggled = this.toggleService.isSidebarToggled;

  readonly isToggled = this.themeService.isToggled;

  constructor() {
    effect(
      () => {
        const userId = this.userStore.userId();
        const currentPhoto = this.userStore.photoUrl();
        if (userId && !currentPhoto) {
          this.userSync
            .getProfilePicture(userId)
            .pipe(take(1))
            .subscribe({ error: () => {} });
        }
      },
      { injector: this.injector },
    );
  }

  // Burger Menu Toggle
  toggle() {
    this.toggleService.toggle();
  }

  // Navbar Sticky
  isSticky = false;
  checkScroll() {
    const scrollPosition =
      window.scrollY ||
      document.documentElement.scrollTop ||
      document.body.scrollTop ||
      0;
    this.isSticky = scrollPosition >= 50;
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
