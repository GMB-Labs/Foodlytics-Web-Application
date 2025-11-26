import { Injectable, inject } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable, of } from "rxjs";
import { catchError, finalize, map, shareReplay, tap } from "rxjs/operators";
import { environment } from "../../../../../environments/environment";

@Injectable({ providedIn: "root" })
export class PatientPictureApiService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/api/v1/profiles`;
  private readonly cache = new Map<string, string | null>();
  private readonly pending = new Map<string, Observable<string | null>>();
  private readonly isBrowser = typeof window !== "undefined";

  getProfilePicture(userId: string): Observable<string | null> {
    if (!userId || !this.isBrowser) {
      return of(null);
    }

    if (this.cache.has(userId)) {
      return of(this.cache.get(userId) ?? null);
    }

    const existingRequest = this.pending.get(userId);
    if (existingRequest) {
      return existingRequest;
    }

    const encodedId = encodeURIComponent(userId);

    const request$ = this.http
      .get(`${this.apiUrl}/${encodedId}/picture`, {
        responseType: "blob",
      })
      .pipe(
        map((blob) => {
          if (!blob || blob.size === 0) {
            return null;
          }
          return URL.createObjectURL(blob);
        }),
        catchError(() => of(null)),
        tap((result) => {
          this.setCache(userId, result);
        }),
        finalize(() => {
          this.pending.delete(userId);
        }),
        shareReplay(1),
      );

    this.pending.set(userId, request$);
    return request$;
  }

  private setCache(userId: string, url: string | null): void {
    const previous = this.cache.get(userId);
    if (previous && previous.startsWith("blob:") && previous !== url) {
      URL.revokeObjectURL(previous);
    }
    this.cache.set(userId, url);
  }
}
