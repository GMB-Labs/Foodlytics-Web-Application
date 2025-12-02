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
import { DatePipe, NgOptimizedImage } from "@angular/common";
import { CustomizerSettingsService } from "../../../../../core/customizer-settings/customizer-settings.service";
import { PatientsApiService } from "../../../../patients/data-access/api/patients.api";
import { Patient } from "../../../../patients/domain/models";
import { UserStore } from "../../../../../core/user/user.store";
import { LoggerService } from "../../../../../core/logger/logger.service";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";

@Component({
  selector: "app-recent-activity:not(p)",
  imports: [
    MatCardModule,
    MatMenuModule,
    MatButtonModule,
    NgOptimizedImage,
    DatePipe,
  ],
  templateUrl: "./recent-activity.component.html",
  styleUrl: "./recent-activity.component.scss",
})
export class RecentActivityComponent implements OnInit {
  private static readonly MAX_ITEMS = 5;

  private readonly patientsApi = inject(PatientsApiService);
  private readonly userStore = inject(UserStore);
  private readonly logger = inject(LoggerService);
  private readonly destroyRef = inject(DestroyRef);

  private readonly activitiesSignal = signal<RecentActivityListItem[]>([]);
  private readonly loadingSignal = signal(false);
  private readonly errorSignal = signal<string | null>(null);

  protected readonly activities = computed(() => this.activitiesSignal());
  protected readonly loading = computed(() => this.loadingSignal());
  protected readonly error = computed(() => this.errorSignal());

  private readonly fallbackAvatars: string[] = [
    "assets/images/users/user1.webp",
    "assets/images/users/user2.webp",
    "assets/images/users/user3.webp",
    "assets/images/users/user4.webp",
    "assets/images/users/user5.webp",
  ];

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
          this.activitiesSignal.set(this.mapPatientsToActivity(patients ?? []));
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
        avatarUrl: this.resolveAvatarUrl(patient.user_id),
        joinedAt: patient.created_at,
      }));
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

  private getDateValue(value?: string | null): number {
    if (!value) return 0;
    const timestamp = Date.parse(value);
    return Number.isNaN(timestamp) ? 0 : timestamp;
  }
}

interface RecentActivityListItem {
  id: string;
  fullName: string;
  avatarUrl: string;
  joinedAt: string | null | undefined;
}
