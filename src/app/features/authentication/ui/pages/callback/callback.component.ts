import { Component, inject, OnInit, PLATFORM_ID, signal } from "@angular/core";
import { HttpErrorResponse } from "@angular/common/http";
import { MatButtonModule } from "@angular/material/button";
import { MatProgressSpinner } from "@angular/material/progress-spinner";
import { AuthService } from "@auth0/auth0-angular";
import { Router } from "@angular/router";
import { isPlatformBrowser } from "@angular/common";
import { combineLatest, take } from "rxjs";
import { filter, map } from "rxjs/operators";
import { CustomizerSettingsService } from "../../../../../core/customizer-settings/customizer-settings.service";
import { LoggerService } from "../../../../../core/logger/logger.service";
import { UserSyncService } from "../../../../../core/user/user-sync.service";
import { AuthFacade } from "../../../../../core/auth/auth.facade";

@Component({
  selector: "app-confirm-email",
  imports: [MatButtonModule, MatProgressSpinner],
  templateUrl: "./callback.component.html",
  styleUrl: "./callback.component.scss",
})
export class CallbackComponent implements OnInit {
  private readonly logger = inject(LoggerService);
  public themeService = inject(CustomizerSettingsService);
  private readonly router = inject(Router);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly auth = inject(AuthService);
  private readonly authFacade = inject(AuthFacade);
  private readonly userSync = inject(UserSyncService);

  readonly isBrowser = isPlatformBrowser(this.platformId);
  readonly isLoading = signal(true);
  readonly syncError = signal<string | null>(null);
  private targetRoute = "/dashboard";

  ngOnInit() {
    if (!this.isBrowser) return;

    combineLatest([this.auth.isLoading$, this.auth.isAuthenticated$])
      .pipe(
        filter(([loading]) => !loading),
        take(1),
        map(([, isAuth]) => isAuth),
      )
      .subscribe({
        next: (isAuth) => {
          if (!isAuth) {
            this.isLoading.set(false);
            this.router
              .navigateByUrl("/auth")
              .then((r) => this.logger.log("Navigate to auth"));
            return;
          }

          this.auth.appState$.pipe(take(1)).subscribe((state: any) => {
            this.targetRoute = state?.target ?? "/dashboard";
            this.runUserSync();
          });
        },

        error: () => {
          this.isLoading.set(false);
          this.router
            .navigateByUrl("/auth")
            .then((r) => this.logger.log("Navigate to auth"));
        },
      });
  }

  retrySync() {
    this.runUserSync();
  }

  continueWithoutSync() {
    this.syncError.set(null);
    this.isLoading.set(false);
    this.navigateToTarget();
  }

  private runUserSync() {
    this.isLoading.set(true);
    this.syncError.set(null);

    this.userSync
      .syncUserProfile()
      .pipe(take(1))
      .subscribe({
        next: () => {
          this.isLoading.set(false);
          this.navigateToTarget();
        },
        error: (error: unknown) => {
          this.handleSyncError(error);
        },
      });
  }

  private handleSyncError(error: unknown) {
    const status = (error as HttpErrorResponse)?.status;

    if (status === 401 || status === 403) {
      this.logger.error("User sync unauthorized, forcing logout", error);
      this.authFacade.logout();
      return;
    }

    this.logger.error("User sync call failed", error);
    this.syncError.set("sync_failed");
    this.isLoading.set(false);
  }

  private navigateToTarget() {
    this.router.navigateByUrl(this.targetRoute).then(
      () => this.logger.log(`Navigate to ${this.targetRoute}`),
      () => console.error(`Failed to navigate to ${this.targetRoute}`),
    );
  }
}
