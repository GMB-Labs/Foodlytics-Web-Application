import { Injectable, computed, signal } from "@angular/core";

export interface UserProfile {
  user_id?: string;
  first_name?: string;
  last_name?: string;
  age?: number;
  gender?: string;
  user_profile_completed?: boolean;
  height_cm?: number;
  weight_kg?: number;
  goal_type?: string;
  activity_level?: string;
  desired_weight_kg?: number;
  [key: string]: unknown;
}

export type UserProfileResponse = UserProfile | string | null;

@Injectable({ providedIn: "root" })
export class UserStore {
  private readonly profileSig = signal<UserProfileResponse>(null);
  private readonly syncErrorSig = signal<string | null>(null);
  private readonly photoUrlSig = signal<string | null>(null);

  readonly profile = computed(() => this.profileSig());
  readonly syncError = computed(() => this.syncErrorSig());
  readonly photoUrl = computed(() => this.photoUrlSig());

  readonly userId = computed<string | null>(() => {
    const profile = this.profileSig();
    if (typeof profile === "string") return profile;
    if (profile && typeof profile === "object") {
      const maybeId = (profile as Record<string, unknown>)["id"] as
        | string
        | undefined;
      return (profile.user_id as string | undefined) ?? maybeId ?? null;
    }
    return null;
  });

  readonly isProfileCompleted = computed<boolean>(() => {
    const profile = this.profileSig();
    if (!profile || typeof profile !== "object") return false;
    return profile.user_profile_completed === true;
  });

  setProfile(profile: UserProfileResponse): void {
    this.profileSig.set(profile);
  }

  setSyncError(error: string | null): void {
    this.syncErrorSig.set(error);
  }

  setPhotoUrl(url: string | null): void {
    const current = this.photoUrlSig();
    if (current && current.startsWith("blob:")) {
      URL.revokeObjectURL(current);
    }
    this.photoUrlSig.set(url);
  }

  clear(): void {
    this.profileSig.set(null);
    this.syncErrorSig.set(null);
    this.setPhotoUrl(null);
  }
}
