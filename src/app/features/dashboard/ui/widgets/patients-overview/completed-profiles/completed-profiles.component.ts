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
import { Patient } from "../../../../../patients/domain/models";
import { UserStore } from "../../../../../../core/user/user.store";
import { LoggerService } from "../../../../../../core/logger/logger.service";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";

@Component({
  selector: "app-completed-profiles",
  imports: [MatCardModule, MatProgressSpinnerModule],
  templateUrl: "./completed-profiles.component.html",
  styleUrl: "./completed-profiles.component.scss",
})
export class CompletedProfilesComponent implements OnInit {
  private readonly patientsApi = inject(PatientsApiService);
  private readonly userStore = inject(UserStore);
  private readonly logger = inject(LoggerService);
  private readonly destroyRef = inject(DestroyRef);

  private readonly patientsSignal = signal<Patient[]>([]);
  private readonly loadingSignal = signal(false);

  protected readonly completedProfiles = computed(() => {
    return this.patientsSignal().filter(
      (p) => p.user_profile_completed === true,
    ).length;
  });

  protected readonly totalPatients = computed(() => this.patientsSignal().length);

  protected readonly completionPercentage = computed(() => {
    const total = this.totalPatients();
    if (total === 0) return 0;
    return Math.round((this.completedProfiles() / total) * 100);
  });

  protected readonly loading = computed(() => this.loadingSignal());

  constructor(public themeService: CustomizerSettingsService) {}

  ngOnInit(): void {
    this.loadPatients();
  }

  private loadPatients(): void {
    const nutritionistId = this.userStore.userId();
    if (!nutritionistId) {
      this.logger.error(
        "[CompletedProfilesComponent] Missing nutritionist user id when loading patients",
      );
      return;
    }

    this.loadingSignal.set(true);
    this.patientsApi
      .getPatientsByNutritionist(nutritionistId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (patients: Patient[]) => {
          queueMicrotask(() => {
            this.patientsSignal.set(patients ?? []);
            this.loadingSignal.set(false);
          });
        },
        error: (error: unknown) => {
          this.logger.error(
            "[CompletedProfilesComponent] Error loading patients",
            error,
          );
          queueMicrotask(() => this.loadingSignal.set(false));
        },
      });
  }
}
