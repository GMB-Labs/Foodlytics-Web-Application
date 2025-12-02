import {
  Component,
  DestroyRef,
  OnInit,
  computed,
  inject,
  signal,
  ChangeDetectorRef,
  effect,
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
  avatarUrl: string | null;
  initials: string;
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
  private readonly cdr = inject(ChangeDetectorRef);

  private readonly patientsSignal = signal<PatientWithAvatar[]>([]);
  private readonly loadingSignal = signal(false);
  private lastLoadedUserId: string | null = null;

  protected readonly totalPatients = computed(() => this.patientsSignal().length);
  protected readonly loading = computed(() => this.loadingSignal());
  protected readonly recentPatients = computed(() => {
    return this.patientsSignal().slice(0, 5);
  });

  constructor(public themeService: CustomizerSettingsService) {
    // Effect que observa cambios en userId y recarga cuando esté disponible
    effect(() => {
      const userId = this.userStore.userId();
      if (userId && userId !== this.lastLoadedUserId) {
        this.lastLoadedUserId = userId;
        this.loadPatients();
      }
    });
  }

  ngOnInit(): void {
    // Intentar cargar si ya hay userId disponible
    const userId = this.userStore.userId();
    if (userId && userId !== this.lastLoadedUserId) {
      this.loadPatients();
    }
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
            avatarUrl: null,
            initials: this.buildInitials(p.first_name, p.last_name),
          }));
          this.patientsSignal.set(patientsWithAvatars);
          this.loadProfilePictures(patientsWithAvatars.slice(0, 5));
          this.loadingSignal.set(false);
          this.cdr.detectChanges();
        },
        error: (error: unknown) => {
          this.logger.error(
            "[TotalPatientsComponent] Error loading patients",
            error,
          );
          this.loadingSignal.set(false);
          this.cdr.detectChanges();
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
    this.patientsSignal.update((patients) =>
      patients.map((p) =>
        p.user_id === userId ? { ...p, avatarUrl } : p,
      ),
    );
    this.cdr.detectChanges();
  }

  private buildInitials(
    firstName?: string | null,
    lastName?: string | null,
  ): string {
    const initials = [firstName, lastName]
      .map((value) => (value ?? "").trim())
      .filter(Boolean)
      .map((value) => value[0]?.toUpperCase() ?? "")
      .join("")
      .slice(0, 2);

    return initials || "P";
  }
}
