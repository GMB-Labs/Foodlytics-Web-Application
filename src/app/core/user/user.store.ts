import { Injectable, computed, signal } from "@angular/core";

export type SyncedUserProfile = Record<string, unknown> | string;

@Injectable({ providedIn: "root" })
export class UserStore {
  private readonly profileSig = signal<SyncedUserProfile | null>(null);
  private readonly syncErrorSig = signal<string | null>(null);

  readonly profile = computed(() => this.profileSig());
  readonly syncError = computed(() => this.syncErrorSig());

  setProfile(profile: SyncedUserProfile | null): void {
    this.profileSig.set(profile);
  }

  setSyncError(error: string | null): void {
    this.syncErrorSig.set(error);
  }

  clear(): void {
    this.profileSig.set(null);
    this.syncErrorSig.set(null);
  }
}
