import {
  Component,
  DestroyRef,
  inject,
  PLATFORM_ID,
  signal,
  computed,
} from "@angular/core";
import { SidebarComponent } from "../../common/sidebar/sidebar.component";
import { HeaderComponent } from "../../common/header/header.component";
import { Event, NavigationEnd, Router, RouterOutlet } from "@angular/router";
import { FooterComponent } from "../../common/footer/footer.component";
import { CustomizerSettingsComponent } from "../../core/customizer-settings/customizer-settings.component";
import { ToggleService } from "../../common/sidebar/toggle.service";
import { isPlatformBrowser, NgClass, ViewportScroller } from "@angular/common";
import { CustomizerSettingsService } from "../../core/customizer-settings/customizer-settings.service";
import { takeUntilDestroyed, toSignal } from "@angular/core/rxjs-interop";
import { filter } from "rxjs";
import { AuthService } from "@auth0/auth0-angular";
import { MatProgressSpinner } from "@angular/material/progress-spinner";

@Component({
  selector: "app-app-shell",
  template: `
    @if (loadingApp()) {
      <div
        class="d-flex justify-content-center align-items-center"
        style="height:100vh; width:100%;"
      >
        <div class="spinner-wrapper text-center">
          <mat-spinner diameter="40"> </mat-spinner>
        </div>
      </div>
    } @else {
      <div
        [class.card-borderd-theme]="themeService.isCardBorder()"
        [class.card-border-radius]="themeService.isCardBorderRadius()"
        [class.rtl-enabled]="themeService.isRTLEnabled()"
      >
        <!-- Sidebar -->
        <app-sidebar />

        <!-- Main Content -->
        <div
          class="main-content transition d-flex flex-column"
          [ngClass]="{ active: isSidebarToggled }"
          [class.right-sidebar]="themeService.isRightSidebar()"
          [class.hide-sidebar]="themeService.isHideSidebar()"
        >
          <app-header />
          <router-outlet />
          <div class="flex-grow-1"></div>
          <app-footer />
        </div>

        <!-- Customizer Settings -->
        <app-customizer-settings />
      </div>
    }
  `,
  styleUrl: "./app-shell.component.scss",
  imports: [
    SidebarComponent,
    HeaderComponent,
    RouterOutlet,
    FooterComponent,
    CustomizerSettingsComponent,
    NgClass,
    MatProgressSpinner,
  ],
  host: { class: "block" },
})
export class AppShellComponent {
  protected readonly title = signal("Foodlytics - Web Application");
  readonly themeService = inject(CustomizerSettingsService);

  isSidebarToggled = false;

  private readonly router = inject(Router);
  private readonly viewport = inject(ViewportScroller);
  private readonly toggleService = inject(ToggleService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly isBrowser = isPlatformBrowser(this.platformId);

  private previousUrl: string | null = null;

  // 👇 Auth0
  private readonly auth = this.isBrowser ? inject(AuthService) : null;
  private readonly authLoadingSig = this.isBrowser
    ? toSignal(this.auth!.isLoading$, { initialValue: true })
    : signal(true);

  // lo que usa el template
  readonly loadingApp = computed(() => this.authLoadingSig());

  constructor() {
    this.toggleService.isSidebarToggled$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((v) => (this.isSidebarToggled = v));

    this.router.events
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        filter((e): e is NavigationEnd => e instanceof NavigationEnd),
      )
      .subscribe((e) => {
        if (!this.isBrowser) return;
        const currentUrl = e.urlAfterRedirects;
        if (this.previousUrl && this.previousUrl !== currentUrl) {
          this.viewport.scrollToPosition([0, 0]);
        }
        this.previousUrl = currentUrl;
      });
  }
}
