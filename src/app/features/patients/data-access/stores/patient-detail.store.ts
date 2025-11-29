import { Injectable, computed, inject, signal } from "@angular/core";
import { firstValueFrom } from "rxjs";
import { LoggerService } from "../../../../core/logger/logger.service";
import {
  UserProfile,
  UserProfileResponse,
} from "../../../../core/user/user.store";
import { UserSyncService } from "../../../../core/user/user-sync.service";
import { PatientPictureApiService } from "../api/patient-picture.api";
import {
  DailySummaryStatus,
  MealEntry,
  PatientCalorieTargets,
  PatientDailySummary,
  PatientsApiService,
} from "../api/patients.api";

export interface PatientDetailViewModel {
  fullName: string;
  genderLabel: string;
  goalLabel: string;
  secondaryInfo: string;
  weightDisplay: string;
  ageDisplay: string;
  heightDisplay: string;
}

export interface MacroTargetDisplay {
  gramsValue: number | null;
  gramsLabel: string;
  percentValue: number | null;
  percentLabel: string;
}

export interface MacroTargetsOverview {
  macros: {
    protein: MacroTargetDisplay;
    carbs: MacroTargetDisplay;
    fats: MacroTargetDisplay;
  };
  chartSeries: number[];
}

export interface DailyCalorieCardOverview {
  targetLabel: string;
  consumedLabel: string;
  differenceLabel: string;
  statusLabel: string;
  badgeClass: "up" | "down" | "neutral";
  badgeIcon: "trending_up" | "trending_down" | "trending_flat";
}

export interface MealTimelineEntry {
  id: string;
  mealType: string;
  description: string;
  timeLabel: string;
  kcalLabel: string | null;
}

@Injectable({ providedIn: "root" })
export class PatientDetailStore {
  private static readonly PLACEHOLDER = "—";
  private readonly logger = inject(LoggerService);
  private readonly userSync = inject(UserSyncService);
  private readonly patientPictureApi = inject(PatientPictureApiService);
  private readonly patientsApi = inject(PatientsApiService);

  private readonly profileSig = signal<UserProfile | null>(null);
  private readonly profileLoadingSig = signal(false);
  private readonly photoUrlSig = signal<string | null>(null);
  private readonly photoLoadingSig = signal(false);
  private readonly errorSig = signal<string | null>(null);
  private readonly currentUserIdSig = signal<string | null>(null);
  private readonly calorieTargetsSig = signal<PatientCalorieTargets | null>(
    null,
  );
  private readonly calorieTargetsErrorSig = signal<string | null>(null);
  private readonly bmiSig = signal<number | null>(null);
  private readonly dailySummarySig = signal<PatientDailySummary | null>(null);
  private readonly dailySummaryLoadingSig = signal(false);
  private readonly dailySummaryErrorSig = signal<string | null>(null);
  private readonly mealsSig = signal<MealEntry[] | null>(null);
  private readonly mealsLoadingSig = signal(false);
  private readonly mealsErrorSig = signal<string | null>(null);

  readonly profile = computed(() => this.profileSig());
  readonly loading = computed(() => this.profileLoadingSig());
  readonly photoUrl = computed(() => this.photoUrlSig());
  readonly photoLoading = computed(() => this.photoLoadingSig());
  readonly error = computed(() => this.errorSig());
  readonly currentUserId = computed(() => this.currentUserIdSig());
  readonly viewModel = computed<PatientDetailViewModel>(() =>
    this.buildViewModel(this.profileSig()),
  );
  readonly bmi = computed(() => this.bmiSig());
  readonly calorieTargetsError = computed(() => this.calorieTargetsErrorSig());
  readonly dailySummary = computed(() => this.dailySummarySig());
  readonly dailySummaryLoading = computed(
    () => this.dailySummaryLoadingSig(),
  );
  readonly dailySummaryError = computed(() => this.dailySummaryErrorSig());
  readonly macroOverview = computed<MacroTargetsOverview>(() =>
    this.buildMacroOverview(this.dailySummarySig()),
  );
  readonly calorieCardOverview = computed<DailyCalorieCardOverview>(() =>
    this.buildCalorieCardOverview(this.dailySummarySig()),
  );
  readonly mealsTimeline = computed<MealTimelineEntry[]>(() =>
    this.buildMealsTimeline(this.mealsSig()),
  );
  readonly mealsLoading = computed(() => this.mealsLoadingSig());
  readonly mealsError = computed(() => this.mealsErrorSig());

  loadPatient(userId: string | null | undefined): void {
    if (!userId) {
      this.logger.warn(
        "[PatientDetailStore] Tried to load patient without user_id",
      );
      this.errorSig.set("missing_user_id");
      this.profileSig.set(null);
      this.photoUrlSig.set(null);
      this.calorieTargetsSig.set(null);
      this.calorieTargetsErrorSig.set("missing_user_id");
      this.dailySummarySig.set(null);
      this.dailySummaryErrorSig.set("missing_user_id");
      this.mealsSig.set(null);
      this.mealsErrorSig.set("missing_user_id");
      this.bmiSig.set(null);
      this.currentUserIdSig.set(null);
      return;
    }

    this.currentUserIdSig.set(userId);
    void this.fetchProfile(userId);
    void this.fetchPhoto(userId);
    void this.fetchCalorieTargets(userId);
    void this.fetchDailySummary(userId);
    void this.fetchMeals(userId);
  }

  private async fetchProfile(userId: string): Promise<void> {
    this.profileLoadingSig.set(true);
    this.errorSig.set(null);

    try {
      const response = await firstValueFrom(
        this.userSync.fetchProfile(userId, { updateStore: false }),
      );
      this.profileSig.set(this.normalizeProfile(response));
    } catch (error) {
      this.logger.error(
        "[PatientDetailStore] Error loading patient profile",
        error,
      );
      this.profileSig.set(null);
      this.errorSig.set("profile_load_failed");
    } finally {
      this.profileLoadingSig.set(false);
    }
  }

  private async fetchPhoto(userId: string): Promise<void> {
    this.photoLoadingSig.set(true);
    try {
      const url = await firstValueFrom(
        this.patientPictureApi.getProfilePicture(userId),
      );
      this.photoUrlSig.set(url);
    } catch (error) {
      this.logger.warn(
        "[PatientDetailStore] Error loading patient photo",
        error,
      );
      this.photoUrlSig.set(null);
    } finally {
      this.photoLoadingSig.set(false);
    }
  }

  private async fetchCalorieTargets(patientId: string): Promise<void> {
    this.calorieTargetsErrorSig.set(null);
    try {
      const response = await firstValueFrom(
        this.patientsApi.getCalorieTargets(patientId),
      );
      this.calorieTargetsSig.set(response ?? null);
      this.bmiSig.set(this.normalizeNumber(response?.bmi));
    } catch (error) {
      this.logger.warn(
        "[PatientDetailStore] Error loading calorie targets",
        error,
      );
      this.calorieTargetsSig.set(null);
      this.bmiSig.set(null);
      this.calorieTargetsErrorSig.set("calorie_targets_load_failed");
    }
  }

  private async fetchDailySummary(patientId: string): Promise<void> {
    this.dailySummaryLoadingSig.set(true);
    this.dailySummaryErrorSig.set(null);
    try {
      const day = this.getCurrentDayString();
      const response = await firstValueFrom(
        this.patientsApi.getDailyCalorieSummary(patientId, day),
      );
      this.dailySummarySig.set(response ?? null);
    } catch (error) {
      this.logger.warn(
        "[PatientDetailStore] Error loading daily calorie summary",
        error,
      );
      this.dailySummarySig.set(null);
      this.dailySummaryErrorSig.set("daily_summary_load_failed");
    } finally {
      this.dailySummaryLoadingSig.set(false);
    }
  }

  private async fetchMeals(patientId: string): Promise<void> {
    this.mealsLoadingSig.set(true);
    this.mealsErrorSig.set(null);
    try {
      const day = this.getCurrentDayString();
      const response = await firstValueFrom(
        this.patientsApi.getMealsByDay(patientId, day),
      );
      this.mealsSig.set(response ?? []);
    } catch (error) {
      this.logger.warn(
        "[PatientDetailStore] Error loading meals timeline",
        error,
      );
      this.mealsSig.set(null);
      this.mealsErrorSig.set("meals_load_failed");
    } finally {
      this.mealsLoadingSig.set(false);
    }
  }

  private normalizeProfile(
    response: UserProfileResponse,
  ): UserProfile | null {
    if (!response) {
      return null;
    }
    if (typeof response === "string") {
      return { user_id: response };
    }
    return response as UserProfile;
  }

  private buildViewModel(profile: UserProfile | null): PatientDetailViewModel {
    const placeholder = PatientDetailStore.PLACEHOLDER;
    const firstName = profile?.first_name?.trim() ?? "";
    const lastName = profile?.last_name?.trim() ?? "";
    const fullName =
      [firstName, lastName].filter(Boolean).join(" ") || placeholder;

    const genderLabel = this.mapGender(profile?.gender);
    const goalLabel = this.mapGoal(profile?.goal_type);
    const secondaryInfo = this.composeSecondary(genderLabel, goalLabel);

    return {
      fullName,
      genderLabel,
      goalLabel,
      secondaryInfo,
      weightDisplay: this.formatMeasurement(profile?.weight_kg, "kg"),
      ageDisplay: this.formatMeasurement(profile?.age, "años"),
      heightDisplay: this.formatMeasurement(profile?.height_cm, "cm"),
    };
  }

  private buildMacroOverview(
    summary: PatientDailySummary | null,
  ): MacroTargetsOverview {
    const consumed = summary?.consumed;
    const protein = this.buildMacroDisplay(consumed?.protein);
    const carbs = this.buildMacroDisplay(consumed?.carbs);
    const fats = this.buildMacroDisplay(consumed?.fats);
    const macroList = [protein, carbs, fats];
    const total = macroList.reduce(
      (sum, macro) => sum + (macro.gramsValue ?? 0),
      0,
    );
    const hasAnyValue = total > 0;

    macroList.forEach((macro) => {
      if (macro.gramsValue === null || !hasAnyValue) {
        macro.percentValue = null;
        macro.percentLabel = `${PatientDetailStore.PLACEHOLDER}%`;
        return;
      }
      const percent = (macro.gramsValue / total) * 100;
      macro.percentValue = percent;
      macro.percentLabel = `${Math.round(percent)}%`;
    });

    const chartSeries = hasAnyValue
      ? macroList.map((macro) => macro.gramsValue ?? 0)
      : [];

    return {
      macros: {
        protein,
        carbs,
        fats,
      },
      chartSeries,
    };
  }

  private buildCalorieCardOverview(
    summary: PatientDailySummary | null,
  ): DailyCalorieCardOverview {
    const placeholder = `${PatientDetailStore.PLACEHOLDER} kcal`;
    const targetCalories = this.normalizeNumber(summary?.target?.calories);
    const consumedCalories = this.normalizeNumber(
      summary?.consumed?.calories,
    );
    const differenceCalories = this.normalizeNumber(
      summary?.difference?.calories,
    );

    const targetLabel =
      targetCalories !== null
        ? `${this.formatWholeNumber(targetCalories)} kcal`
        : placeholder;

    const consumedLabel = `Consumidas hoy: ${
      consumedCalories !== null
        ? `${this.formatWholeNumber(consumedCalories)} kcal`
        : `${PatientDetailStore.PLACEHOLDER} kcal`
    }`;

    const differenceLabel =
      differenceCalories !== null
        ? `${differenceCalories > 0 ? "+" : ""}${this.formatWholeNumber(
            differenceCalories,
          )} kcal`
        : `${PatientDetailStore.PLACEHOLDER} kcal`;

    const { badgeClass, badgeIcon, statusLabel } = this.mapStatusMetadata(
      summary?.status ?? null,
      differenceCalories,
    );

    return {
      targetLabel,
      consumedLabel,
      differenceLabel,
      statusLabel,
      badgeClass,
      badgeIcon,
    };
  }

  private mapStatusMetadata(
    status: DailySummaryStatus | null,
    difference: number | null,
  ): {
    badgeClass: "up" | "down" | "neutral";
    badgeIcon: "trending_up" | "trending_down" | "trending_flat";
    statusLabel: string;
  } {
    switch (status) {
      case "under_target":
        return {
          badgeClass: "down",
          badgeIcon: "trending_down",
          statusLabel: "Bajo objetivo",
        };
      case "over_target":
        return {
          badgeClass: "up",
          badgeIcon: "trending_up",
          statusLabel: "Sobre objetivo",
        };
      case "on_target":
        return {
          badgeClass: "neutral",
          badgeIcon: "trending_flat",
          statusLabel: "En objetivo",
        };
      default: {
        if (difference !== null && difference !== 0) {
          return difference > 0
            ? {
                badgeClass: "up",
                badgeIcon: "trending_up",
                statusLabel: "Sobre objetivo",
              }
            : {
                badgeClass: "down",
                badgeIcon: "trending_down",
                statusLabel: "Bajo objetivo",
              };
        }
        return {
          badgeClass: "neutral",
          badgeIcon: "trending_flat",
          statusLabel: "Sin datos",
        };
      }
    }
  }

  private buildMacroDisplay(value?: number | null): MacroTargetDisplay {
    const normalized = this.normalizeNumber(value);
    return {
      gramsValue: normalized,
      gramsLabel:
        normalized !== null
          ? `${this.formatWholeNumber(normalized)} g`
          : PatientDetailStore.PLACEHOLDER,
      percentValue: null,
      percentLabel: `${PatientDetailStore.PLACEHOLDER}%`,
    };
  }

  private buildMealsTimeline(
    meals: MealEntry[] | null,
  ): MealTimelineEntry[] {
    if (!meals || !meals.length) {
      return [];
    }
    const sorted = [...meals].sort((a, b) => {
      const dateA = this.parseDate(a.uploaded_at);
      const dateB = this.parseDate(b.uploaded_at);
      if (dateA && dateB) {
        return dateA.getTime() - dateB.getTime();
      }
      return 0;
    });

    return sorted.map((meal) => ({
      id: meal.id,
      mealType: meal.meal_t || "Comida",
      description: meal.name || "Sin descripción",
      timeLabel: this.formatTimeLabel(meal.uploaded_at),
      kcalLabel:
        typeof meal.kcal === "number"
          ? `${this.formatWholeNumber(meal.kcal)} kcal`
          : null,
    }));
  }

  private mapGender(value?: string | null): string {
    if (!value) return PatientDetailStore.PLACEHOLDER;
    switch (value.toLowerCase()) {
      case "male":
        return "Male";
      case "female":
        return "Female";
      case "other":
        return "Other";
      default:
        return PatientDetailStore.PLACEHOLDER;
    }
  }

  private mapGoal(value?: string | null): string {
    if (!value) return PatientDetailStore.PLACEHOLDER;
    switch (value.toLowerCase()) {
      case "definition":
        return "Definition";
      case "maintenance":
        return "Maintenance";
      case "bulking":
        return "Bulking";
      default:
        return PatientDetailStore.PLACEHOLDER;
    }
  }

  private composeSecondary(...values: string[]): string {
    const placeholder = PatientDetailStore.PLACEHOLDER;
    const filtered = values.filter((value) => value !== placeholder);
    if (!filtered.length) {
      return placeholder;
    }
    return filtered.join(" · ");
  }

  private formatMeasurement(
    value?: number | null,
    unit?: string,
  ): string {
    const placeholder = PatientDetailStore.PLACEHOLDER;
    if (value === null || value === undefined || value === 0) {
      return placeholder;
    }
    const rounded =
      Number.isFinite(value) && !Number.isNaN(value) ? value : Number(value);
    if (!Number.isFinite(rounded) || rounded === 0) {
      return placeholder;
    }
    return unit ? `${rounded} ${unit}` : `${rounded}`;
  }

  private formatWholeNumber(value: number): string {
    return value.toLocaleString("es-ES", {
      maximumFractionDigits: 0,
      minimumFractionDigits: 0,
    });
  }

  private normalizeNumber(value?: number | null): number | null {
    if (value === null || value === undefined) {
      return null;
    }
    if (typeof value !== "number" || Number.isNaN(value)) {
      return null;
    }
    if (!Number.isFinite(value)) {
      return null;
    }
    return value;
  }

  private getCurrentDayString(): string {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const day = String(today.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }

  private parseDate(value?: string | null): Date | null {
    if (!value) return null;
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? null : date;
  }

  private formatTimeLabel(value?: string | null): string {
    const date = this.parseDate(value);
    if (!date) {
      return "—";
    }
    const formatter = new Intl.DateTimeFormat("es-ES", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
    return `${formatter.format(date)} H`;
  }
}

