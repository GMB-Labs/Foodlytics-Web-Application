import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Injectable, inject } from "@angular/core";
import {
  Observable,
  catchError,
  defaultIfEmpty,
  of,
  switchMap,
  take,
  tap,
  throwError,
} from "rxjs";
import { environment } from "../../../environments/environment";
import { AuthFacade } from "../auth/auth.facade";
import { LoggerService } from "../logger/logger.service";
import { UserProfile, UserProfileResponse, UserStore } from "./user.store";

@Injectable({ providedIn: "root" })
export class UserSyncService {
  private readonly http = inject(HttpClient);
  private readonly auth = inject(AuthFacade);
  private readonly userStore = inject(UserStore);
  private readonly logger = inject(LoggerService);
  private readonly apiUrl = environment.apiUrl;

  syncUserProfile(): Observable<UserProfileResponse> {
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

        return this.http
          .post<UserProfileResponse>(
            `${this.apiUrl}/api/v1/users-sync/sync`,
            {},
            { headers },
          )
          .pipe(
            switchMap((profile) =>
              this.handleProfileResponse(profile, headers),
            ),
        );
      }),
      catchError((error) => {
        this.logger.error("User sync failed", error);
        this.handleAuthErrors(error);
        this.userStore.setProfile(null);
        this.userStore.setSyncError("sync_failed");
        return throwError(() => error);
      }),
    );
  }

  fetchProfile(userId: string): Observable<UserProfileResponse> {
    const encodedId = encodeURIComponent(userId);
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

        return this.http
          .get<UserProfileResponse>(`${this.apiUrl}/api/v1/profiles/${encodedId}`, {
            headers,
          })
          .pipe(
            tap((profile) => {
              this.userStore.setProfile(profile ?? null);
              this.userStore.setSyncError(null);
            }),
          );
      }),
      catchError((error) => {
        this.logger.error("Fetch profile failed", error);
        this.handleAuthErrors(error);
        this.userStore.setSyncError("profile_fetch_failed");
        return throwError(() => error);
      }),
    );
  }

  updateUserProfile(
    userId: string,
    payload: Partial<UserProfile>,
  ): Observable<UserProfileResponse> {
    const encodedId = encodeURIComponent(userId);
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

        return this.http
          .put<UserProfileResponse>(
            `${this.apiUrl}/api/v1/profiles/${encodedId}`,
            payload,
            { headers },
          )
          .pipe(
            switchMap((profile) =>
              this.handleProfileResponse(profile, headers),
            ),
          );
      }),
      catchError((error) => {
        this.logger.error("Update profile failed", error);
        this.handleAuthErrors(error);
        this.userStore.setSyncError("profile_update_failed");
        return throwError(() => error);
      }),
    );
  }

  uploadProfilePicture(
    userId: string,
    file: File,
  ): Observable<UserProfileResponse> {
    const encodedId = encodeURIComponent(userId);
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

        const body = new FormData();
        body.append("file", file);

        return this.http
          .patch<UserProfileResponse>(
            `${this.apiUrl}/api/v1/profiles/${encodedId}/picture`,
            body,
            { headers },
          )
          .pipe(
            switchMap((profile) =>
              this.handleProfileResponse(profile, headers),
            ),
          );
      }),
      catchError((error) => {
        this.logger.error("Upload profile picture failed", error);
        this.handleAuthErrors(error);
        this.userStore.setSyncError("profile_picture_failed");
        return throwError(() => error);
      }),
    );
  }

  getProfilePicture(userId: string): Observable<string | null> {
    const encodedId = encodeURIComponent(userId);
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

        return this.http
          .get(`${this.apiUrl}/api/v1/profiles/${encodedId}/picture`, {
            headers,
            responseType: "blob",
          })
          .pipe(
            switchMap((blob) => {
              const objectUrl = URL.createObjectURL(blob);
              this.userStore.setPhotoUrl(objectUrl);
              return of(objectUrl);
            }),
          );
      }),
      catchError((error) => {
        this.logger.error("Fetch profile picture failed", error);
        this.handleAuthErrors(error);
        return throwError(() => error);
      }),
    );
  }

  private handleProfileResponse(
    profile: UserProfileResponse,
    headers: HttpHeaders,
  ): Observable<UserProfileResponse> {
    this.userStore.setProfile(profile ?? null);
    this.userStore.setSyncError(null);

    const needsFullProfile =
      typeof profile === "string" ||
      (profile && typeof profile === "object"
        ? profile.user_profile_completed === undefined
        : false);

    const userId = this.userStore.userId();

    if (needsFullProfile && userId) {
      const encodedId = encodeURIComponent(userId);
      return this.http
        .get<UserProfileResponse>(`${this.apiUrl}/api/v1/profiles/${encodedId}`, {
          headers,
        })
        .pipe(
          tap((fullProfile) => {
            this.userStore.setProfile(fullProfile ?? null);
            this.userStore.setSyncError(null);
          }),
        );
    }

    return of(profile ?? null);
  }

  private handleAuthErrors(error: unknown): void {
    const status = (error as { status?: number })?.status;
    if (status === 401 || status === 403) {
      this.auth.logout();
    }
  }
}
