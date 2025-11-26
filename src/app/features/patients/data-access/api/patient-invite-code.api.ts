import { inject, Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { environment } from "../../../../../environments/environment";

export interface InviteCodeResponse {
  code: string;
}

@Injectable({ providedIn: "root" })
export class PatientInviteCodeApiService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/api/v1/profiles/nutritionists`;

  createInviteCode(userId: string): Observable<InviteCodeResponse> {
    return this.http.post<InviteCodeResponse>(
      `${this.apiUrl}/${userId}/invite-code`,
      {},
    );
  }
}

