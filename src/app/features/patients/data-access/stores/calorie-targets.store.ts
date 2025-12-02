import { Injectable, computed, inject, signal } from "@angular/core";
import { firstValueFrom } from "rxjs";
import { LoggerService } from "../../../../core/logger/logger.service";
import {
  CalorieTargetsApiService,
  CalorieTargetsResponse,
} from "../api/calorie-targets-api.service";

@Injectable({ providedIn: "root" })
export class CalorieTargetsStore {
  private readonly logger = inject(LoggerService);
  private readonly api = inject(CalorieTargetsApiService);

  private readonly targetsSig = signal<CalorieTargetsResponse | null>(null);
  private readonly loadingSig = signal<boolean>(false);
  private readonly errorSig = signal<string | null>(null);
  private lastLoadedPatientId: string | null = null;

  readonly targets = computed(() => this.targetsSig());
  readonly loading = computed(() => this.loadingSig());
  readonly error = computed(() => this.errorSig());

  readonly totalCalories = computed(() => {
    const targets = this.targetsSig();
    return targets?.calories ?? null;
  });

  readonly proteinGrams = computed(() => {
    const targets = this.targetsSig();
    return targets?.protein_grams ?? null;
  });

  readonly carbGrams = computed(() => {
    const targets = this.targetsSig();
    return targets?.carb_grams ?? null;
  });

  readonly fatGrams = computed(() => {
    const targets = this.targetsSig();
    return targets?.fat_grams ?? null;
  });

  readonly bmi = computed(() => {
    const targets = this.targetsSig();
    return targets?.bmi ?? null;
  });

  load(patientId: string | null | undefined): void {
    if (!patientId) {
      this.logger.warn(
        "[CalorieTargetsStore] Tried to load targets without patient_id",
      );
      this.targetsSig.set(null);
      this.errorSig.set("missing_patient_id");
      this.loadingSig.set(false);
      this.lastLoadedPatientId = null;
      return;
    }

    if (this.lastLoadedPatientId === patientId && this.targetsSig() !== null) {
      return;
    }

    this.lastLoadedPatientId = patientId;
    void this.fetchTargets(patientId);
  }

  private async fetchTargets(patientId: string): Promise<void> {
    this.loadingSig.set(true);
    this.errorSig.set(null);

    try {
      const response = await firstValueFrom(
        this.api.getCalorieTargets(patientId),
      );
      this.targetsSig.set(response);
    } catch (error) {
      this.logger.error(
        "[CalorieTargetsStore] Error loading calorie targets",
        error,
      );
      this.targetsSig.set(null);
      this.errorSig.set("load_failed");
    } finally {
      this.loadingSig.set(false);
    }
  }
}

