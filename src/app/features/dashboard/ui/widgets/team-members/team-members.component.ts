import {
  Component,
  DestroyRef,
  OnInit,
  computed,
  inject,
  signal,
} from "@angular/core";
import { MatCardModule } from "@angular/material/card";
import { CustomizerSettingsService } from "../../../../../core/customizer-settings/customizer-settings.service";
import { NgForOf, NgIf, NgOptimizedImage } from "@angular/common";
import { PatientsApiService } from "../../../data-access/api/patients.api";
import { Patient } from "../../../domain/models";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { UserStore } from "../../../../../core/user/user.store";
import { LoggerService } from "../../../../../core/logger/logger.service";

@Component({
  selector: "app-team-members:not(p)",
  imports: [
    MatCardModule,
    NgOptimizedImage,
    NgForOf,
    NgIf,
  ],
  templateUrl: "./team-members.component.html",
  styleUrl: "./team-members.component.scss",
})
export class TeamMembersComponent implements OnInit {
  private readonly patientsApi = inject(PatientsApiService);
  private readonly userStore = inject(UserStore);
  private readonly logger = inject(LoggerService);
  private readonly destroyRef = inject(DestroyRef);

  private readonly patientsSignal = signal<PatientListItem[]>([]);
  private readonly loadingSignal = signal(false);
  private readonly errorSignal = signal<string | null>(null);

  protected readonly patients = computed(() => this.patientsSignal());
  protected readonly totalPatients = computed(
    () => this.patientsSignal().length,
  );
  protected readonly loading = computed(() => this.loadingSignal());
  protected readonly error = computed(() => this.errorSignal());

  private readonly fallbackAvatars: string[] = [
    "assets/images/users/user1.webp",
    "assets/images/users/user2.webp",
    "assets/images/users/user3.webp",
    "assets/images/users/user4.webp",
  ];

  constructor(public themeService: CustomizerSettingsService) {}

  ngOnInit(): void {
    this.loadPatients();
  }

  protected readonly trackByPatient = (_: number, item: PatientListItem) =>
    item.id;

  private loadPatients(): void {
    const userId = this.userStore.userId();
    if (!userId) {
      this.logger.error(
        "[TeamMembersComponent] Missing nutritionist user id when loading patients",
      );
      this.errorSignal.set("missing_user");
      return;
    }

    this.loadingSignal.set(true);
    this.patientsApi
      .getPatientsByNutritionist(userId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (patients) => {
          this.patientsSignal.set(this.mapPatients(patients ?? []));
          this.errorSignal.set(null);
          this.loadingSignal.set(false);
        },
        error: (error) => {
          this.logger.error(
            "[TeamMembersComponent] Error loading patients",
            error,
          );
          this.errorSignal.set("load_failed");
          this.loadingSignal.set(false);
        },
      });
  }

  private mapPatients(patients: Patient[]): PatientListItem[] {
    return patients.map((patient) => ({
      id: patient.user_id,
      fullName: this.buildFullName(patient.first_name, patient.last_name),
      avatarUrl: this.resolveAvatarUrl(patient.user_id),
    }));
  }

  private buildFullName(
    firstName?: string | null,
    lastName?: string | null,
  ): string {
    const parts = [firstName, lastName]
      .map((value) => (value ?? "").trim())
      .filter((value) => !!value);
    return parts.length ? parts.join(" ") : "Unnamed Patient";
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

interface PatientListItem {
  id: string;
  fullName: string;
  avatarUrl: string;
}
