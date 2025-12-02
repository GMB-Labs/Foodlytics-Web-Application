import {
  Component,
  DestroyRef,
  OnInit,
  computed,
  inject,
  signal,
} from "@angular/core";
import { MatButtonModule } from "@angular/material/button";
import { MatCardModule } from "@angular/material/card";
import { MatMenuModule } from "@angular/material/menu";
import { DatePipe } from "@angular/common";
import { CustomizerSettingsService } from "../../../../../core/customizer-settings/customizer-settings.service";
import { PatientsApiService } from "../../../../patients/data-access/api/patients.api";
import { PatientPictureApiService } from "../../../../patients/data-access/api/patient-picture.api";
import { Patient } from "../../../../patients/domain/models";
import { UserStore } from "../../../../../core/user/user.store";
import { LoggerService } from "../../../../../core/logger/logger.service";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { take } from "rxjs";

@Component({
  selector: "app-recent-activity:not(p)",
  imports: [
    MatCardModule,
    MatMenuModule,
    MatButtonModule,
    DatePipe,
  ],
  templateUrl: "./recent-activity.component.html",
  styleUrl: "./recent-activity.component.scss",
})
export class RecentActivityComponent implements OnInit {
  private static readonly MAX_ITEMS = 5;

  private readonly patientsApi = inject(PatientsApiService);
  private readonly patientPictureApi = inject(PatientPictureApiService);
  private readonly userStore = inject(UserStore);
  private readonly logger = inject(LoggerService);
  private readonly destroyRef = inject(DestroyRef);

  private readonly activitiesSignal = signal<RecentActivityListItem[]>([]);
  private readonly loadingSignal = signal(false);
  private readonly errorSignal = signal<string | null>(null);

  protected readonly activities = computed(() => this.activitiesSignal());
  protected readonly loading = computed(() => this.loadingSignal());
  protected readonly error = computed(() => this.errorSignal());

  constructor(public themeService: CustomizerSettingsService) {}

  ngOnInit(): void {
    this.loadRecentActivity();
  }

  private loadRecentActivity(): void {
    const nutritionistId = this.userStore.userId();
    if (!nutritionistId) {
      this.logger.error(
        "[RecentActivityComponent] Missing nutritionist user id when loading patients",
      );
      this.errorSignal.set("missing_user");
      return;
    }

    this.loadingSignal.set(true);
    this.patientsApi
      .getPatientsByNutritionist(nutritionistId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (patients: Patient[]) => {
          const activities = this.mapPatientsToActivity(patients ?? []);
          this.activitiesSignal.set(activities);
          this.loadProfilePictures(activities);
          this.errorSignal.set(null);
          this.loadingSignal.set(false);
        },
        error: (error: unknown) => {
          this.logger.error(
            "[RecentActivityComponent] Error loading patients",
            error,
          );
          this.errorSignal.set("load_failed");
          this.loadingSignal.set(false);
        },
      });
  }

  private mapPatientsToActivity(patients: Patient[]): RecentActivityListItem[] {
    return patients
      .slice()
      .sort(
        (a, b) => this.getDateValue(b.created_at) - this.getDateValue(a.created_at),
      )
      .slice(0, RecentActivityComponent.MAX_ITEMS)
      .map((patient) => ({
        id: patient.user_id,
        fullName: this.buildFullName(patient.first_name, patient.last_name),
        avatarUrl: null,
        initials: this.buildInitials(patient.first_name, patient.last_name),
        hasProfilePicture: patient.has_profile_picture,
        joinedAt: patient.created_at,
      }));
  }

  private loadProfilePictures(activities: RecentActivityListItem[]): void {
    activities.forEach((activity) => {
      if (!activity.hasProfilePicture) {
        return;
      }

      this.patientPictureApi
        .getProfilePicture(activity.id)
        .pipe(take(1), takeUntilDestroyed(this.destroyRef))
        .subscribe((pictureUrl) => {
          if (!pictureUrl) {
            return;
          }

          queueMicrotask(() => {
            this.activitiesSignal.update((items) =>
              items.map((item) =>
                item.id === activity.id ? { ...item, avatarUrl: pictureUrl } : item,
              ),
            );
          });
        });
    });
  }

  private buildFullName(
    firstName?: string | null,
    lastName?: string | null,
  ): string {
    const parts = [firstName, lastName]
      .map((value) => (value ?? "").trim())
      .filter((value) => !!value);
    return parts.length ? parts.join(" ") : "Paciente sin nombre";
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

  private getDateValue(value?: string | null): number {
    if (!value) return 0;
    const timestamp = Date.parse(value);
    return Number.isNaN(timestamp) ? 0 : timestamp;
  }
}

interface RecentActivityListItem {
  id: string;
  fullName: string;
  avatarUrl: string | null;
  initials: string;
  hasProfilePicture: boolean;
  joinedAt: string | null | undefined;
}
