import { Injectable, inject } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { environment } from "../../../../../environments/environment";

export interface DailySummaryDay {
  day: string; // YYYY-MM-DD
  consumed: {
    calories: number;
    protein: number;
    carbs: number;
    fats: number;
  };
}

export interface DailySummariesRangeResponse {
  patient_id: string;
  days: DailySummaryDay[];
}

@Injectable({ providedIn: "root" })
export class PatientDailySummariesApiService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/api/v1/calorie-targets`;

  getDailySummariesRange(
    patientId: string,
    startDate: string,
    endDate: string,
  ): Observable<DailySummariesRangeResponse> {
    const encodedId = encodeURIComponent(patientId);
    return this.http.get<DailySummariesRangeResponse>(
      `${this.apiUrl}/${encodedId}/daily-summaries/range`,
      {
        params: {
          start_date: startDate,
          end_date: endDate,
        },
      },
    );
  }
}

