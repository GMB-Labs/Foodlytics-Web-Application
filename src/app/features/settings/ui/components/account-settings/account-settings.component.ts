import {
  Component,
  Injector,
  computed,
  effect,
  inject,
  signal,
} from "@angular/core";
import { MatButtonModule } from "@angular/material/button";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatInputModule } from "@angular/material/input";
import { MatSelectModule } from "@angular/material/select";
import { FileUploadControl, FileUploadModule } from "@iplab/ngx-file-upload";
import { FormBuilder, ReactiveFormsModule, Validators } from "@angular/forms";
import { UserSyncService } from "../../../../../core/user/user-sync.service";
import { UserProfile, UserStore } from "../../../../../core/user/user.store";
import { LoggerService } from "../../../../../core/logger/logger.service";
import { catchError, finalize, of, switchMap, take } from "rxjs";
import { CustomizerSettingsService } from "../../../../../core/customizer-settings/customizer-settings.service";
import { MatDatepickerModule } from "@angular/material/datepicker";
import { MatNativeDateModule } from "@angular/material/core";

@Component({
  selector: "app-account-settings",
  imports: [
    MatButtonModule,
    MatInputModule,
    MatFormFieldModule,
    MatSelectModule,
    FileUploadModule,
    ReactiveFormsModule,
    MatDatepickerModule,
    MatNativeDateModule,
  ],
  templateUrl: "./account-settings.component.html",
  styleUrl: "./account-settings.component.scss",
})
export class AccountSettingsComponent {
  // File Uploader
  public multiple = false;
  readonly photoControl = new FileUploadControl({ multiple: false });

  readonly isSubmitting = signal(false);

  private readonly fb = inject(FormBuilder);
  private readonly userSync = inject(UserSyncService);
  private readonly userStore = inject(UserStore);
  private readonly logger = inject(LoggerService);
  private readonly injector = inject(Injector);

  readonly profileForm = this.fb.nonNullable.group({
    first_name: this.fb.nonNullable.control("", {
      validators: [Validators.required],
    }),
    last_name: this.fb.nonNullable.control("", {
      validators: [Validators.required],
    }),
    age: this.fb.control<Date | null>(null, {
      validators: [Validators.required],
    }),
    gender: this.fb.nonNullable.control("male", {
      validators: [Validators.required],
    }),
  });

  readonly profileCompleted = computed(() =>
    this.userStore.isProfileCompleted(),
  );

  readonly profileActionLabel = computed(() =>
    this.profileCompleted() ? "Update Profile" : "Complete Profile",
  );

  readonly hasUserId = computed(() => !!this.userStore.userId());

  constructor(public themeService: CustomizerSettingsService) {
    effect(
      () => {
        const profile = this.userStore.profile();
        if (profile && typeof profile === "object") {
          this.profileForm.patchValue(
            {
              first_name: profile.first_name ?? "",
              last_name: profile.last_name ?? "",
              age: this.deriveDateFromAge(profile.age),
              gender: profile.gender ?? "male",
            },
            { emitEvent: false },
          );
        }
      },
      { injector: this.injector },
    );

    effect(
      () => {
        if (!this.userStore.userId() && !this.userStore.profile()) {
          this.userSync.syncUserProfile().pipe(take(1)).subscribe();
        }
      },
      { injector: this.injector },
    );
  }

  onSubmit(): void {
    if (this.profileForm.invalid) {
      this.profileForm.markAllAsTouched();
      return;
    }

    const userId = this.userStore.userId();
    if (!userId) {
      this.logger.error("Cannot update profile without a user id");
      return;
    }

    const { first_name, last_name, age, gender } =
      this.profileForm.getRawValue();

    const payload: Partial<UserProfile> = {
      first_name: first_name?.trim() || undefined,
      last_name: last_name?.trim() || undefined,
      age: age ? this.calculateAge(age) : undefined,
      gender: gender ?? undefined,
      user_profile_completed: true,
    };

    const selectedFile = this.photoControl.value.at(0) ?? null;
    if (selectedFile && selectedFile.size > 5 * 1024 * 1024) {
      this.logger.error("Profile picture exceeds 5MB limit");
      return;
    }

    this.isSubmitting.set(true);
    this.userSync
      .updateUserProfile(userId, payload)
      .pipe(
        switchMap(() =>
          selectedFile
            ? this.userSync.uploadProfilePicture(userId, selectedFile)
            : of(null),
        ),
        switchMap(() =>
          this.userSync
            .getProfilePicture(userId)
            .pipe(catchError(() => of(null))),
        ),
        take(1),
        finalize(() => this.isSubmitting.set(false)),
      )
      .subscribe({
        error: (error) => {
          this.logger.error("Failed to update profile", error);
        },
      });
  }

  private calculateAge(date: Date): number {
    const now = new Date();
    let age = now.getFullYear() - date.getFullYear();
    const m = now.getMonth() - date.getMonth();
    if (m < 0 || (m === 0 && now.getDate() < date.getDate())) {
      age--;
    }
    return age;
  }

  private deriveDateFromAge(age?: number): Date | null {
    if (!age || Number.isNaN(age)) return null;
    const now = new Date();
    const birthYear = now.getFullYear() - age;
    return new Date(birthYear, now.getMonth(), now.getDate());
  }
}
