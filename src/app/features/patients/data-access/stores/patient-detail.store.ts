import { Injectable, computed, inject, signal } from "@angular/core";
import { firstValueFrom } from "rxjs";
import { LoggerService } from "../../../../core/logger/logger.service";
import {
  UserProfile,
  UserProfileResponse,
} from "../../../../core/user/user.store";
import { UserSyncService } from "../../../../core/user/user-sync.service";
import { PatientPictureApiService } from "../api/patient-picture.api";

export interface PatientDetailViewModel {
  fullName: string;
  genderLabel: string;
  goalLabel: string;
  secondaryInfo: string;
  weightDisplay: string;
  ageDisplay: string;
  heightDisplay: string;
}

@Injectable({ providedIn: "root" })
export class PatientDetailStore {
  private static readonly PLACEHOLDER = "—";
  private readonly logger = inject(LoggerService);
  private readonly userSync = inject(UserSyncService);
  private readonly patientPictureApi = inject(PatientPictureApiService);

  private readonly profileSig = signal<UserProfile | null>(null);
  private readonly profileLoadingSig = signal(false);
  private readonly photoUrlSig = signal<string | null>(null);
  private readonly photoLoadingSig = signal(false);
  private readonly errorSig = signal<string | null>(null);
  private readonly currentUserIdSig = signal<string | null>(null);

  readonly profile = computed(() => this.profileSig());
  readonly loading = computed(() => this.profileLoadingSig());
  readonly photoUrl = computed(() => this.photoUrlSig());
  readonly photoLoading = computed(() => this.photoLoadingSig());
  readonly error = computed(() => this.errorSig());
  readonly currentUserId = computed(() => this.currentUserIdSig());
  readonly viewModel = computed<PatientDetailViewModel>(() =>
    this.buildViewModel(this.profileSig()),
  );

  loadPatient(userId: string | null | undefined): void {
    if (!userId) {
      this.logger.warn(
        "[PatientDetailStore] Tried to load patient without user_id",
      );
      this.errorSig.set("missing_user_id");
      this.profileSig.set(null);
      this.photoUrlSig.set(null);
      this.currentUserIdSig.set(null);
      return;
    }

    this.currentUserIdSig.set(userId);
    void this.fetchProfile(userId);
    void this.fetchPhoto(userId);
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
}

