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
  phone_number?: string;
  activity_level?: string;
  desired_weight_kg?: number;
  [key: string]: unknown;
}

export type UserProfileResponse = UserProfile | string | null;

@Injectable({ providedIn: "root" })
export class UserStore {
  private static readonly STORAGE_KEY = "foodlytics.user-store";
  private readonly profileSig = signal<UserProfileResponse>(null);
  private readonly syncErrorSig = signal<string | null>(null);
  private readonly photoUrlSig = signal<string | null>(null);

  constructor() {
    this.restoreFromStorage();
  }

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
    this.persist();
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
    this.persist();
  }

  setUserId(userId: string | null | undefined): void {
    if (!userId) return;
    const profile = this.profileSig();
    if (profile && typeof profile === "object") {
      if (profile.user_id === userId) return;
      this.profileSig.set({ ...profile, user_id: userId });
    } else {
      this.profileSig.set(userId);
    }
    this.persist();
  }

  clear(): void {
    this.profileSig.set(null);
    this.syncErrorSig.set(null);
    this.setPhotoUrl(null);
    this.removePersisted();
  }

  private restoreFromStorage(): void {
    if (typeof localStorage === "undefined") return;
    try {
      const raw = localStorage.getItem(UserStore.STORAGE_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw) as {
        profile?: UserProfileResponse;
        photoUrl?: string | null;
      };
      if (parsed.profile !== undefined) {
        this.profileSig.set(parsed.profile ?? null);
      }
      if (parsed.photoUrl && !parsed.photoUrl.startsWith("blob:")) {
        this.photoUrlSig.set(parsed.photoUrl);
      }
    } catch {
      /* ignore corrupted storage */
    }
  }

  private persist(): void {
    if (typeof localStorage === "undefined") return;
    try {
      const photoUrl = this.photoUrlSig();
      const payload = JSON.stringify({
        profile: this.profileSig(),
        photoUrl: photoUrl?.startsWith("blob:") ? null : photoUrl,
      });
      localStorage.setItem(UserStore.STORAGE_KEY, payload);
    } catch {
      /* no-op */
    }
  }

  private removePersisted(): void {
    if (typeof localStorage === "undefined") return;
    try {
      localStorage.removeItem(UserStore.STORAGE_KEY);
    } catch {
      /* no-op */
    }
  }
}
