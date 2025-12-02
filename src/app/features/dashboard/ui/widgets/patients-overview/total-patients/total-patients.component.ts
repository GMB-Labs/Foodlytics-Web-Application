import {
  Component,
  DestroyRef,
  OnInit,
  computed,
  inject,
  signal,
} from "@angular/core";
import { MatCardModule } from "@angular/material/card";
import { MatProgressSpinnerModule } from "@angular/material/progress-spinner";
import { CustomizerSettingsService } from "../../../../../../core/customizer-settings/customizer-settings.service";
import { PatientsApiService } from "../../../../../patients/data-access/api/patients.api";
import { PatientPictureApiService } from "../../../../../patients/data-access/api/patient-picture.api";
import { Patient } from "../../../../../patients/domain/models";
import { UserStore } from "../../../../../../core/user/user.store";
import { LoggerService } from "../../../../../../core/logger/logger.service";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { take } from "rxjs/operators";

interface PatientWithAvatar extends Patient {
  avatarUrl: string;
}

@Component({
  selector: "app-total-patients",
  imports: [MatCardModule, MatProgressSpinnerModule],
  templateUrl: "./total-patients.component.html",
  styleUrl: "./total-patients.component.scss",
})
export class TotalPatientsComponent implements OnInit {
  private readonly patientsApi = inject(PatientsApiService);
  private readonly patientPictureApi = inject(PatientPictureApiService);
  private readonly userStore = inject(UserStore);
  private readonly logger = inject(LoggerService);
  private readonly destroyRef = inject(DestroyRef);

  private readonly patientsSignal = signal<PatientWithAvatar[]>([]);
  private readonly loadingSignal = signal(false);

  protected readonly totalPatients = computed(() => this.patientsSignal().length);
  protected readonly loading = computed(() => this.loadingSignal());
  protected readonly recentPatients = computed(() => {
    return this.patientsSignal().slice(0, 5);
  });

  private readonly fallbackAvatars: string[] = [
    "assets/images/users/user1.webp",
    "assets/images/users/user2.webp",
    "assets/images/users/user3.webp",
    "assets/images/users/user4.webp",
    "assets/images/users/user5.webp",
    "assets/images/users/user12.webp",
    "assets/images/users/user13.webp",
    "assets/images/users/user14.webp",
    "assets/images/users/user15.webp",
    "assets/images/users/user16.webp",
  ];

  constructor(public themeService: CustomizerSettingsService) {}

  ngOnInit(): void {
    this.loadPatients();
  }

  private loadPatients(): void {
    const nutritionistId = this.userStore.userId();
    if (!nutritionistId) {
      this.logger.error(
        "[TotalPatientsComponent] Missing nutritionist user id when loading patients",
      );
      return;
    }

    this.loadingSignal.set(true);
    this.patientsApi
      .getPatientsByNutritionist(nutritionistId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (patients: Patient[]) => {
          const patientsWithAvatars = (patients ?? []).map((p) => ({
            ...p,
            avatarUrl: this.resolveAvatarUrl(p.user_id),
          }));
          this.patientsSignal.set(patientsWithAvatars);
          this.loadProfilePictures(patientsWithAvatars.slice(0, 5));
          this.loadingSignal.set(false);
        },
        error: (error: unknown) => {
          this.logger.error(
            "[TotalPatientsComponent] Error loading patients",
            error,
          );
          this.loadingSignal.set(false);
        },
      });
  }

  private loadProfilePictures(patients: PatientWithAvatar[]): void {
    patients.forEach((patient) => {
      if (!patient.has_profile_picture) {
        return;
      }

      this.patientPictureApi
        .getProfilePicture(patient.user_id)
        .pipe(take(1), takeUntilDestroyed(this.destroyRef))
        .subscribe((pictureUrl) => {
          if (!pictureUrl) {
            return;
          }

          this.updatePatientAvatar(patient.user_id, pictureUrl);
        });
    });
  }

  private updatePatientAvatar(userId: string, avatarUrl: string): void {
    // Defer update to next cycle to avoid NG0100
    setTimeout(() => {
      this.patientsSignal.update((patients) =>
        patients.map((p) =>
          p.user_id === userId ? { ...p, avatarUrl } : p,
        ),
      );
    }, 0);
  }

  private resolveAvatarUrl(userId?: string | null): string {
    const fallbackIndex =
      Math.abs(this.hashString(userId ?? "")) % this.fallbackAvatars.length;
    return this.fallbackAvatars[fallbackIndex];
  }

  private hashString(value: string): number {
    if (!value) return 0;
    let hash = 0;
    for (let i = 0; i < value.length; i += 1) {
      hash = (hash << 5) - hash + value.charCodeAt(i);
      hash |= 0;
    }
    return hash;
  }
}
