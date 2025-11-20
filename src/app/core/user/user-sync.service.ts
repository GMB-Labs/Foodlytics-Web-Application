import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Injectable, inject } from "@angular/core";
import {
  catchError,
  defaultIfEmpty,
  switchMap,
  take,
  tap,
  throwError,
} from "rxjs";
import { environment } from "../../../environments/environment";
import { AuthFacade } from "../auth/auth.facade";
import { LoggerService } from "../logger/logger.service";
import { SyncedUserProfile, UserStore } from "./user.store";

@Injectable({ providedIn: "root" })
export class UserSyncService {
  private readonly http = inject(HttpClient);
  private readonly auth = inject(AuthFacade);
  private readonly userStore = inject(UserStore);
  private readonly logger = inject(LoggerService);
  private readonly apiUrl = environment.apiUrl;

  syncUserProfile() {
    return this.auth.getAccessTokenSilently().pipe(
      take(1),
      defaultIfEmpty(null),
      switchMap((accessToken) => {
        if (!accessToken) {
          return throwError(() => new Error("Missing access token"));
        }

        const headers = new HttpHeaders({
          Authorization: `Bearer ${accessToken}`,
        });

        return this.http.post<SyncedUserProfile>(
          `${this.apiUrl}/api/v1/users-sync/sync`,
          {},
          { headers },
        );
      }),
      tap((profile) => {
        this.userStore.setProfile(profile ?? null);
        this.userStore.setSyncError(null);
      }),
      catchError((error) => {
        this.logger.error("User sync failed", error);
        this.userStore.setProfile(null);
        this.userStore.setSyncError("sync_failed");
        return throwError(() => error);
      }),
    );
  }
}
