import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  OnInit,
  computed,
  effect,
  inject,
} from "@angular/core";
import { MatButtonModule } from "@angular/material/button";
import { MatCardModule } from "@angular/material/card";
import { MatMenuModule } from "@angular/material/menu";
import { DatePipe, NgOptimizedImage } from "@angular/common";
import { CustomizerSettingsService } from "../../../../../core/customizer-settings/customizer-settings.service";
import type { UserProfile } from "../../../../../core/user/user.store";
import { UserStore } from "../../../../../core/user/user.store";
import { AuthFacade } from "../../../../../core/auth/auth.facade";
import { UserSyncService } from "../../../../../core/user/user-sync.service";
import { take } from "rxjs";
import { Injector } from "@angular/core";

@Component({
  selector: "app-welcome:not(p)",
  imports: [MatCardModule, MatMenuModule, MatButtonModule, NgOptimizedImage],
  templateUrl: "./welcome.component.html",
  styleUrl: "./welcome.component.scss",
  providers: [DatePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WelcomeComponent implements OnInit {
  private readonly datePipe = inject(DatePipe);
  readonly themeService = inject(CustomizerSettingsService);
  private readonly userStore = inject(UserStore);
  private readonly authFacade = inject(AuthFacade);
  private readonly userSync = inject(UserSyncService);
  private readonly injector = inject(Injector);
  private readonly destroyRef = inject(DestroyRef);

  readonly currentDate = computed(() =>
    this.datePipe.transform(new Date(), "EEEE, MMMM d"),
  );

  readonly nutritionistName = computed(() => {
    const profile = this.getProfileObject();
    const firstName = profile?.first_name ?? "";
    const lastName = profile?.last_name ?? "";
    const fullName = `${firstName} ${lastName}`.trim();
    return fullName || this.authFacade.displayName() || "Nutritionist";
  });

  readonly photoUrl = computed(() => {
    return (
      this.userStore.photoUrl() ||
      this.authFacade.avatar() ||
      "assets/images/welcome.webp"
    );
  });

  ngOnInit(): void {
    this.ensureProfilePhotoLoaded();
  }

  private ensureProfilePhotoLoaded(): void {
    effect(
      () => {
        const userId = this.userStore.userId();
        const currentPhoto = this.userStore.photoUrl();
        if (userId && !currentPhoto) {
          this.userSync
            .getProfilePicture(userId)
            .pipe(take(1))
            .subscribe({ next: () => {}, error: () => {} });
        }
      },
      { injector: this.injector },
    );
  }

  private getProfileObject(): UserProfile | null {
    const profile = this.userStore.profile();
    if (profile && typeof profile === "object") {
      return profile as UserProfile;
    }
    return null;
  }
}
